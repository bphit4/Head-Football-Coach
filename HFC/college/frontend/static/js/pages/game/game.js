import {
  index_group_sync,
  get,
  nest_children,
  increment_parent,
  deep_copy,intersect,
  round_decimal,seconds_to_time,quarter_seconds_to_time
} from "/common/js/utils.js";
import { nunjucks_env } from "/common/js/nunjucks_tags.js";
import { init_basic_table_sorting } from "/common/js/football-table/football-table.js";
import { draw_player_faces, player_face_listeners } from "/js/faces.js";
import { init_json_edit } from "/common/js/json-edit/json-edit.js";
import { conference_standings } from "/js/widgets.js";

export const page_game = async (common) => {
  nunjucks.configure({ autoescape: true });

  var world_obj = {};
  const game_id = parseInt(common.params.game_id);
  const db = common.db;
  const query_to_dict = common.query_to_dict;
  const index_group = common.index_group;

  var game = db.game.findOne({ game_id: game_id });
  const season = game.season;

  game.week = db.week.findOne({ week_id: game.week_id });

  game.home_team_game = db.team_game.findOne({
    team_game_id: game.home_team_game_id,
  });
  game.away_team_game = db.team_game.findOne({
    team_game_id: game.away_team_game_id,
  });

  var team_seasons = db.team_season.find({team_season_id: {'$in': [
    game.home_team_game.team_season_id,
    game.away_team_game.team_season_id,
  ]}});
  var team_season_ids = team_seasons.map((ts) => ts.team_season_id);
  var team_ids = team_seasons.map((ts) => ts.team_id);

  const team_season_stats = db.team_season_stats.find({team_season_id:{'$in':team_season_ids}});
  const team_season_stats_by_team_season_id = index_group_sync(
    team_season_stats,
    "index",
    "team_season_id"
  );

  var team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");
  const teams = db.team.find({team_id: {'$in': team_ids}});
  var teams_by_team_id = index_group_sync(teams, "index", "team_id");

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  team_seasons = nest_children(
    team_seasons,
    team_season_stats_by_team_season_id,
    "team_season_id",
    "stats"
  );

  var team_stat_box = [];
  var season_stats = [];
  var player_stat_box = [];

  game.home_team_game.team_season =
    team_seasons_by_team_season_id[game.home_team_game.team_season_id];
  game.away_team_game.team_season =
    team_seasons_by_team_season_id[game.away_team_game.team_season_id];

  game.game_headline_display = "";
  if (game.bowl != null) {
    game.game_headline_display = game.bowl.bowl_name;
  } else if (game.rivalry != null) {
    if (game.rivalry.rivalry_name.length > 0) {
      game.game_headline_display = game.rivalry.rivalry_name;
    } else {
      game.game_headline_display = "Rivalry Game";
    }
  }

  var player_team_games = db.player_team_game
    .find({"team_game_id": {'$in': [game.home_team_game_id, game.away_team_game_id]}});

  var player_team_seasons = db.player_team_season.find({ season: season });
  var player_ids = player_team_seasons.map((pts) => pts.player_id);

  var player_team_seasons_by_team_season_id = index_group_sync(
    player_team_seasons,
    "index",
    "player_team_season_id"
  );
  let players = db.player.find({"player_id": {'$in': player_ids}});
  var players_by_player_id = index_group_sync(players, "index", "player_id");

  $.each(player_team_seasons_by_team_season_id, function (ind, player_team_season) {
    player_team_season.player = players_by_player_id[player_team_season.player_id];
    player_team_season.team_season =
      team_seasons_by_team_season_id[player_team_season.team_season_id];
  });

  for (var player_team_game of player_team_games) {
    player_team_game.player_team_season =
      player_team_seasons_by_team_season_id[player_team_game.player_team_season_id];
  }

  const player_team_games_by_team_game_id = index_group_sync(
    player_team_games,
    "group",
    "team_game_id"
  );

  for (var team_game_id in player_team_games_by_team_game_id) {
    if (team_game_id == game.home_team_game.team_game_id) {
      game.home_team_game.player_team_games = player_team_games_by_team_game_id[team_game_id];
    } else {
      game.away_team_game.player_team_games = player_team_games_by_team_game_id[team_game_id];
    }
  }

  var positions_to_display = {
    QB: 1,
    RB: 1,
    WR: 3,
    TE: 1,
    OT: 2,
    IOL: 3,
    EDGE: 2,
    DL: 2,
    LB: 3,
    CB: 2,
    S: 2,
  };

  var team_game_ids = [];
  var player_talent_comparison = [];
  let period_scoring = {};

  if (game.was_played) {
    var show_stat_box = true;
    if (game.scoring.final[0] < game.scoring.final[1]) {
      game.home_outcome_letter = "W";
      game.away_outcome_letter = "L";

      game.outcome_right_arrow = '<i class="fas fa-angle-right"></i>';
    } else {
      game.away_outcome_letter = "W";
      game.home_outcome_letter = "L";

      game.outcome_left_arrow = '<i class="fas fa-angle-left"></i>';
    }

    let overtime_periods = game.scoring.periods.filter((p) => p.period_number > 4);

    console.log({ game: game });

    for (const drive of game.scoring.drives) {
      drive.drive_end.display_team = teams_by_team_id[drive.drive_end.display_team_id];
      if (drive.drive_end.display_team.team_id == game.home_team_game.team_season.team_id) {
        drive.home_or_away = "home";
      } else {
        drive.home_or_away = "away";
      }

      if (
        drive.drive_end.seconds_in_to_game % (15 * 60) == 0 &&
        drive.drive_end.seconds_in_to_game > 0
      ) {
        var seconds_left_in_period = 0;
      } else {
        var seconds_left_in_period = 15 * 60 - (drive.drive_end.seconds_in_to_game % (15 * 60));
      }

      var display_time = seconds_to_time(seconds_left_in_period);
      drive.drive_end.display_time = display_time;

      if (drive.drive_end.play_player_ids) {
        for (let i = 0; i < drive.drive_end.play_player_ids.length; i++) {
          let this_player = players_by_player_id[drive.drive_end.play_player_ids[i]];
          console.log({
            players_by_player_id: players_by_player_id,
            "drive.drive_end.play_player_ids": drive.drive_end.play_player_ids,
            i: i,
            this_player: this_player,
          });
          drive.drive_end.play_description = drive.drive_end.play_description.replace(
            "{player_" + i + "}",
            `<a href="${this_player.player_href}">${this_player.full_name}</a>`
          );
        }
      }

      let drive_period = drive.drive_end.period;
      if (period_scoring[drive_period]) {
        period_scoring[drive_period].push(drive);
      } else {
        period_scoring[drive_period] = [drive];
      }
    }

    player_stat_box = [
      {
        display: "Passing Yards",
        attribute: "game_stats.passing.yards",
        home_player_team_game: null,
        away_player_team_game: null,
      },
      {
        display: "Rushing Yards",
        attribute: "game_stats.rushing.yards",
        home_player_team_game: null,
        away_player_team_game: null,
      },
      {
        display: "Receiving Yards",
        attribute: "game_stats.receiving.yards",
        home_player_team_game: null,
        away_player_team_game: null,
      },
      {
        display: "Tackles",
        attribute: "game_stats.defense.tackles",
        home_player_team_game: null,
        away_player_team_game: null,
      },
    ];

    for (const stat of player_stat_box) {
      stat.home_player_team_game = game.home_team_game.player_team_games.sort(
        (ptg_a, ptg_b) => (get(ptg_b, stat.attribute) || 0) - (get(ptg_a, stat.attribute) || 0)
      )[0];
      stat.home_player_value = get(stat.home_player_team_game, stat.attribute) || 0;

      stat.away_player_team_game = game.away_team_game.player_team_games.sort(
        (ptg_a, ptg_b) => (get(ptg_b, stat.attribute) || 0) - (get(ptg_a, stat.attribute) || 0)
      )[0];
      stat.away_player_value = get(stat.away_player_team_game, stat.attribute) || 0;
    }

    team_stat_box = [
      {
        special_format: false,
        display_name: "Points",
        away_value: game.away_team_game.points,
        home_value: game.home_team_game.points,
      },
      {
        special_format: false,
        indent: "indent",
        display_name: "Biggest Lead",
        away_value: game.away_team_game.game_stats.team.biggest_lead,
        home_value: game.home_team_game.game_stats.team.biggest_lead,
      },
      {
        special_format: false,
        display_name: "Total Yards",
        away_value: game.away_team_game.total_yards,
        home_value: game.home_team_game.total_yards,
      },
      {
        special_format: false,
        indent: "indent",
        display_name: "Pass Yards",
        away_value: game.away_team_game.game_stats.passing.yards,
        home_value: game.home_team_game.game_stats.passing.yards,
      },
      {
        special_format: false,
        indent: "indent",
        display_name: "Rush Yards",
        away_value: game.away_team_game.game_stats.rushing.yards,
        home_value: game.home_team_game.game_stats.rushing.yards,
      },
      {
        special_format: false,
        indent: "indent",
        display_name: "Yards / Play",
        away_value: game.away_team_game.yards_per_play,
        home_value: game.home_team_game.yards_per_play,
      },
      {
        special_format: false,
        display_name: "First Downs",
        away_value: game.away_team_game.game_stats.team.downs.first_downs.total,
        home_value: game.home_team_game.game_stats.team.downs.first_downs.total,
      },
      {
        special_format: true,
        max_value: 100,
        indent: "indent",
        display_name: "Third Down %",
        away_value: game.away_team_game.third_down_conversion_percentage,
        away_display_value: `${game.away_team_game.third_down_conversion_percentage}%`,
        home_value: game.home_team_game.third_down_conversion_percentage,
        home_display_value: `${game.home_team_game.third_down_conversion_percentage}%`,
      },
      {
        special_format: false,
        low_good: true,
        indent: "indent",
        display_name: "Punts",
        away_value: game.away_team_game.game_stats.punting.punts,
        home_value: game.home_team_game.game_stats.punting.punts,
      },
      {
        special_format: true,
        max_value: 60 * 60,
        display_name: "Time of Possession",
        away_value: game.away_team_game.game_stats.team.time_of_possession,
        home_value: game.home_team_game.game_stats.team.time_of_possession,
        away_display_value: game.away_team_game.time_of_possession_formatted,
        home_display_value: game.home_team_game.time_of_possession_formatted,
      },
      {
        special_format: false,
        low_good: true,
        display_name: "Turnovers",
        away_value: game.away_team_game.game_stats.team.turnovers,
        home_value: game.home_team_game.game_stats.team.turnovers,
      },
      {
        special_format: false,
        display_name: "Sacks",
        away_value: game.away_team_game.game_stats.defense.sacks,
        home_value: game.home_team_game.game_stats.defense.sacks,
      },
    ];

    let base_alpha_float = 0.5;

    for (const stat of team_stat_box) {
      // if (!(stat.special_format)){
      //   stat.max_value = Math.max(stat.away_value, stat.home_value);
      // }

      // stat.home_ratio = (stat.home_value / stat.max_value) * 100;
      // stat.away_ratio = (stat.away_value / stat.max_value) * 100;

      // stat.home_end_alpha_float = Math.floor((((stat.home_value / stat.max_value) * (1 - base_alpha_float)) + base_alpha_float) * 255);
      // stat.away_end_alpha_float = Math.floor((((stat.away_value / stat.max_value) * (1 - base_alpha_float)) + base_alpha_float) * 255);

      // stat.home_end_alpha = stat.home_end_alpha_float.toString(16);
      // stat.away_end_alpha = stat.away_end_alpha_float.toString(16);

      if (stat.low_good || false) {
        stat.home_bold = stat.home_value < stat.away_value ? "bold" : "";
        stat.away_bold = stat.away_value < stat.home_value ? "bold" : "";

        stat.home_background_color =
          stat.home_value < stat.away_value
            ? `${game.home_team_game.team_season.team.team_color_primary_hex}`
            : "inherit";
        stat.away_background_color =
          stat.away_value < stat.home_value
            ? `${game.away_team_game.team_season.team.team_color_primary_hex}`
            : "inherit";
      } else {
        stat.home_bold = stat.home_value > stat.away_value ? "bold" : "";
        stat.away_bold = stat.away_value > stat.home_value ? "bold" : "";

        stat.home_background_color =
          stat.home_value > stat.away_value
            ? `${game.home_team_game.team_season.team.team_color_primary_hex}`
            : "inherit";
        stat.away_background_color =
          stat.away_value > stat.home_value
            ? `${game.away_team_game.team_season.team.team_color_primary_hex}`
            : "inherit";
      }

      if (!stat.special_format) {
        stat.home_display_value = stat.home_value;
        stat.away_display_value = stat.away_value;
      }
    }
  } else {
    $.each(positions_to_display, function (pos, count) {
      for (var ind = 0; ind < count; ind++) {
        let position_count = { position: pos };

        position_count.home_player_team_season_id =
          game.home_team_game.team_season.depth_chart[pos][ind];
        position_count.away_player_team_season_id =
          game.away_team_game.team_season.depth_chart[pos][ind];

        position_count.home_player_team_season =
          player_team_seasons_by_team_season_id[position_count.home_player_team_season_id];
        position_count.away_player_team_season =
          player_team_seasons_by_team_season_id[position_count.away_player_team_season_id];

        if (
          position_count.home_player_team_season.ratings.overall.overall >
          position_count.away_player_team_season.ratings.overall.overall
        ) {
          position_count.home_player_team_season.advantage_icon =
            '<i class="fas fa-angle-right"></i>';
          position_count.home_player_team_season.advantage_color =
            position_count.home_player_team_season.team_season.team.team_color_primary_hex;
          position_count.home_player_team_season.advantage_logo_url =
            position_count.home_player_team_season.team_season.team.team_logo;
          if (
            position_count.home_player_team_season.ratings.overall.overall >
            position_count.away_player_team_season.ratings.overall.overall * 1.1
          ) {
            position_count.home_player_team_season.advantage_icon =
              '<i class="fas fa-angle-double-right"></i>';
          }
        } else if (
          position_count.home_player_team_season.ratings.overall.overall <
          position_count.away_player_team_season.ratings.overall.overall
        ) {
          position_count.away_player_team_season.advantage_icon =
            '<i class="fas fa-angle-left"></i>';
          position_count.away_player_team_season.advantage_color =
            position_count.away_player_team_season.team_season.team.team_color_primary_hex;
          position_count.away_player_team_season.advantage_logo_url =
            position_count.away_player_team_season.team_season.team.team_logo;
          if (
            position_count.home_player_team_season.ratings.overall.overall <
            position_count.away_player_team_season.ratings.overall.overall * 0.9
          ) {
            position_count.away_player_team_season.advantage_icon =
              '<i class="fas fa-angle-double-left"></i>';
          }
        }

        player_talent_comparison.push(position_count);
      }
    });

    //BLOCK OF CODE FOR PAST GAMES
    var all_home_team_seasons = db.team_season
      .find({ team_id: game.home_team_game.team_season.team_id })
    var all_home_team_season_ids = all_home_team_seasons.map((ts) => ts.team_season_id);
    var all_home_team_games = db.team_game
      .find({"team_season_id": {'$in': all_home_team_season_ids}})
      
    var all_home_game_ids = all_home_team_games.map((tg) => tg.game_id);

    var all_away_team_seasons = db.team_season
      .find({ team_id: game.away_team_game.team_season.team_id })
    var all_away_team_season_ids = all_away_team_seasons.map((ts) => ts.team_season_id);
    var all_away_team_games = db.team_game
      .find({"team_season_id": {'$in': all_away_team_season_ids}})
    var all_away_game_ids = all_away_team_games.map((tg) => tg.game_id);

    var past_game_ids = intersect(all_home_game_ids, all_away_game_ids);

    var last_team_meetings = db.game.find({game_id: {'$in':past_game_ids}});
    last_team_meetings = last_team_meetings
      .filter((g) => g.was_played)
      .sort((g_a, g_b) => g_b.week_id - g_a.week_id);

    const last_team_meetings_week_ids = last_team_meetings.map((g) => g.week_id);
    const last_team_meetings_weeks = db.week.find({week_id:{'$in':last_team_meetings_week_ids}});
    const last_team_meetings_weeks_by_week_id = index_group_sync(
      last_team_meetings_weeks,
      "index",
      "week_id"
    );

    last_team_meetings = nest_children(
      last_team_meetings,
      last_team_meetings_weeks_by_week_id,
      "week_id",
      "week"
    );

    for (const game of last_team_meetings) {
      game.outcome.winning_team.team = teams_by_team_id[game.outcome.winning_team.team_id];
    }

    if (
      game.home_team_game.team_season.stats.season_stats.games.games_played +
        game.away_team_game.team_season.stats.season_stats.games.games_played ==
      0
    ) {
      season_stats = [];
      show_stat_box = false;
    } else {
      var season_stats = [
        {
          display: "Points Per Game",
          attribute: "points_per_game",
          better: "high",
        },
        {
          display: "Points Allowed Per Game",
          attribute: "points_allowed_per_game",
          better: "low",
        },
        {
          display: "MOV",
          attribute: "point_differential_per_game",
          better: "high",
        },
        {
          display: "Passing Yards Per Game",
          attribute: "passing_yards_per_game",
          better: "high",
        },
        {
          display: "Rushing Yards Per Game",
          attribute: "rushing_yards_per_game",
          better: "high",
        },
        {
          display: "Points Per Drive within 20",
          attribute: "points_per_drive_within_20",
          better: "high",
        },
        {
          display: "Points Per Drive within 40",
          attribute: "points_per_drive_within_40",
          better: "high",
        },
        {
          display: "Down Efficiency",
          attribute: "down_efficiency",
          better: "high",
        },
        {
          display: "Avg Field Position",
          attribute: "average_field_position",
          better: "high",
        },
      ];
      show_stat_box = true;
    }
    //BLOCK OF CODE FOR TEAM STATS

    for (const season_stat of season_stats) {
      season_stat.home_team_value = get(
        game.home_team_game.team_season.stats,
        season_stat.attribute
      );
      season_stat.away_team_value = get(
        game.away_team_game.team_season.stats,
        season_stat.attribute
      );
      season_stat.max_val = Math.max(season_stat.home_team_value, season_stat.away_team_value);

      if (
        (season_stat.home_team_value > season_stat.away_team_value &&
          season_stat.better == "high") ||
        (season_stat.home_team_value < season_stat.away_team_value && season_stat.better == "low")
      ) {
        season_stat.better_team_for_stat = game.home_team_game.team_season.team;
        season_stat.left_arrow = '<i class="fas fa-angle-left"></i>';
      } else {
        season_stat.better_team_for_stat = game.away_team_game.team_season.team;
        season_stat.right_arrow = '<i class="fas fa-angle-right"></i>';
      }
    }
  }

  const NavBarLinks = await common.nav_bar_links({
    path: "Game",
    group_name: "Game",
    db: db,
  });

  const conf_standings = [];

  for (const conference_season_id of [
    ...new Set([
      game.away_team_game.team_season.conference_season_id,
      game.home_team_game.team_season.conference_season_id,
    ]),
  ]) {
    var this_conference_standings = await conference_standings(
      conference_season_id,
      [game.home_team_game.team_season_id, game.away_team_game.team_season_id],
      common
    );

    conf_standings.push(this_conference_standings);
  }

  const box_score_stat_groupings = [
    {
      stat_group_name: "Passing",
      filter_key: "game_stats.passing.attempts",
      order: [[1 + 1, "desc"]],
      columns: [
        { title: "YRD", data: "game_stats.passing.yards" },
        { title: "CMP", data: "game_stats.passing.completions" },
        { title: "ATT", data: "game_stats.passing.attempts" },
        { title: "YPA", data: "passing_yards_per_attempt" },
        { title: "TD", data: "game_stats.passing.tds" },
        { title: "INT", data: "game_stats.passing.ints" },
      ],
    },
    {
      stat_group_name: "Rushing",
      filter_key: "game_stats.rushing.carries",
      order: [[1 + 1, "desc"]],
      columns: [
        { title: "CAR", data: "game_stats.rushing.carries" },
        { title: "YRD", data: "game_stats.rushing.yards" },
        { title: "YPC", data: "rushing_yards_per_carry" },
        { title: "TD", data: "game_stats.rushing.tds" },
        { title: "LNG", data: "game_stats.rushing.lng" },
      ],
    },
    {
      stat_group_name: "Receiving",
      filter_key: "game_stats.receiving.receptions",
      order: [[1 + 1, "desc"]],
      columns: [
        { title: "REC", data: "game_stats.receiving.receptions" },
        { title: "YRD", data: "game_stats.receiving.yards" },
        { title: "YPC", data: "receiving_yards_per_catch" },
        { title: "TD", data: "game_stats.receiving.tds" },
        { title: "LNG", data: "game_stats.receiving.lng" },
      ],
    },
    {
      stat_group_name: "Defense",
      filter_key: "defense_action_count",
      order: [[2 + 1, "desc"]],
      columns: [
        { title: "TCK", data: "game_stats.defense.tackles" },
        { title: "TFL", data: "game_stats.defense.tackles_for_loss" },
        { title: "SACK", data: "game_stats.defense.sacks" },
        { title: "INT", data: "game_stats.defense.ints" },
      ],
    },
  ];

  common.page = {
    PrimaryColor: common.primary_color,
    SecondaryColor: common.secondary_color,
    NavBarLinks: NavBarLinks,
    page_title: `${game.away_team_game.team_season.team.team_abbreviation} @ ${game.home_team_game.team_season.team.team_abbreviation}`,
  };
  var render_content = {
    page: common.page,
    world_id: common.params.world_id,
    game: game,
    player_talent_comparison: player_talent_comparison,
    conference_standings: conf_standings,
    show_stat_box: show_stat_box,
    team_stat_box: team_stat_box,
    box_score_stat_groupings: box_score_stat_groupings,
    last_team_meetings: last_team_meetings,
    season_stats: season_stats,
    player_stat_box: player_stat_box,
    common: common,
    period_scoring: period_scoring,
  };

  common.render_content = render_content;
  console.log(render_content);

  var url = "/html_templates/game/game/template.njk";
  var html = await fetch(url);
  html = await html.text();

  var renderedHtml = nunjucks_env.renderString(html, render_content);

  $("#body").html(renderedHtml);

  common.calculate_team_overalls(common);

  await action(common)
  AddScoringSummaryListeners()
};

const action = async (common) => {
    $(".player-profile-popup-icon").on("click", async function () {
      await common.populate_player_modal(common, this);
    });
  
    $(".gamePlayerBoxStats table").each(function () {
      var table_id = $(this).attr("id");
      init_basic_table_sorting(common, "#" + table_id, 1);
    });
  
    if (common.render_content.game.was_played) {
      var drives = common.render_content.game.scoring.drives;
  
      const game = common.render_content.game;
  
      for (const drive of drives) {
        drive.drive_end.team_drives = [
          {
            seconds_in_to_game: drive.drive_end.seconds_in_to_game,
            points: drive.drive_end.home_team_points,
            team: game.home_team_game.team_season.team,
          },
          {
            seconds_in_to_game: drive.drive_end.seconds_in_to_game,
            points: drive.drive_end.away_team_points,
            team: game.away_team_game.team_season.team,
          },
        ];
      }
  
      var scoring_data = [
        {
          name: game.home_team_game.team_season.team.school_name,
          show: true,
          color:
            "#" + game.home_team_game.team_season.team.team_color_primary_hex,
          final_score: game.home_team_game.points,
          drives: drives.map((d) => d.drive_end.team_drives[0]),
        },
        {
          name: game.away_team_game.team_season.team.school_name,
          show: true,
          color:
            "#" + game.away_team_game.team_season.team.team_color_primary_hex,
          final_score: game.away_team_game.points,
          drives: drives.map((d) => d.drive_end.team_drives[1]),
        },
      ];
  
      var max_time = drives
        .map((d) => d.drive_end.seconds_in_to_game)
        .reduce((acc, val) => Math.max(acc, val), 0);
      max_time = Math.ceil(max_time / (15 * 60)) * (15 * 60);
      var max_points = drives
        .map((d) =>
          Math.max(d.drive_end.away_team_points, d.drive_end.home_team_points)
        )
        .reduce((acc, val) => Math.max(acc, val), 0);
      max_points = Math.ceil((max_points + 0.01) / 5) * 5;
  
      for (var team_index of [0, 1]) {
        scoring_data[team_index].drives.unshift({
          seconds_in_to_game: 0,
          points: 0,
          team: scoring_data[team_index].drives[0].team,
        });
  
        var previous_points = 0;
        var drive_index = 0;
        var drives_to_add = [];
        for (var drive of scoring_data[team_index].drives) {
          if (!(previous_points == drive.points)) {
            drives_to_add.push({
              seconds_in_to_game: drive.seconds_in_to_game,
              points: previous_points,
              team: drive.team,
            });
          }
  
          previous_points = drive.points;
        }
        scoring_data[team_index].drives =
          scoring_data[team_index].drives.concat(drives_to_add);
        scoring_data[team_index].drives = scoring_data[team_index].drives.sort(
          (d_a, d_b) =>
            d_a.seconds_in_to_game - d_b.seconds_in_to_game ||
            d_a.points - d_b.points
        );
      }
  
      var quarters = [1, 2, 3, 4];
      quarters = quarters.map((q) => q * 15 * 60);
  
      function drawChart() {
        // Define margins, dimensions, and some line colors
        const margin = { top: 20, right: 0, bottom: 30, left: 40 };
        const width = $("#GameFlowChart").width() - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
  
        // Define the scales and tell D3 how to draw the line
        const x = d3.scaleLinear().domain([0, max_time]).range([0, width]);
        const y = d3.scaleLinear().domain([0, max_points]).range([height, 0]);
        const line = d3
          .line()
          .x(function (d, ind) {
            return x(d.seconds_in_to_game);
          })
          .y(function (d, ind) {
            return y(d.points);
          });
  
        const chart = d3
          .select("#GameFlowChart")
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
        const tooltip = d3.select("#tooltip");
        const tooltipLine = chart.append("line");
  
        var tipBox = chart
          .append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("opacity", 0)
          .on("mousemove", drawTooltip)
          .on("mouseout", removeTooltip);
  
        // Add the axes and a title
        const xAxis = d3.axisBottom(x).tickFormat(quarter_seconds_to_time);
        const yAxis = d3.axisLeft(y).tickFormat(d3.format(""));
        chart.append("g").call(yAxis);
        chart
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
  
        chart
          .selectAll()
          .data(quarters)
          .enter()
          .append("line")
          .attr("stroke", "#aaa")
          .attr("x1", (q) => x(q))
          .attr("x2", (q) => x(q))
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke-width", 1);
  
        var legend = chart
          .selectAll()
          .data([
            game.home_team_game.team_season.team,
            game.away_team_game.team_season.team,
          ])
          .enter()
          .append("g")
          .attr("class", "legend");
  
        legend
          .append("rect")
          .attr("x", 10)
          .attr("y", function (d, i) {
            return i * 20;
          })
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", function (d) {
            return `#${d.team_color_primary_hex}`;
          });
  
        legend
          .append("text")
          .attr("x", 22)
          .attr("y", function (d, i) {
            return i * 20 + 9;
          })
          .text(function (d) {
            return d.school_name;
          });
  
        chart
          .selectAll()
          .data(scoring_data)
          .enter()
          .append("path")
          .attr("fill", "none")
          .attr("stroke", (d) => d.color)
          .attr("stroke-width", 3)
          .datum(function (d) {
            return d.drives;
          })
          .attr("d", line);
  
        function removeTooltip() {
          if (tooltip) tooltip.style("display", "none");
          if (tooltipLine) tooltipLine.attr("stroke", "none");
        }
  
        function drawTooltip(mouse_event) {
          var xPosition = x.invert(mouse_event.offsetX - margin.left);
          let tooltip_parent = $("#tooltip").parent();
  
          var sorted_drives = drives.sort((drive_a, drive_b) => {
            return (
              Math.abs(drive_a.drive_end.seconds_in_to_game - xPosition) -
              Math.abs(drive_b.drive_end.seconds_in_to_game - xPosition)
            );
          });
  
          var highlighted_drive = sorted_drives[0];
  
          tooltipLine
            .attr("stroke", "#888")
            .attr("x1", x(highlighted_drive.drive_end.seconds_in_to_game))
            .attr("x2", x(highlighted_drive.drive_end.seconds_in_to_game))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke-width", 2);
  
          tooltip
            .html(
              `<span class='bold'>Quarter ${highlighted_drive.drive_end.period}</span> - <span>${highlighted_drive.drive_end.display_time}</span>`
            )
            .style("display", "block")
            .style("left", $(tooltip_parent).position().left)
            .style("top", $(tooltip_parent).position().top)
            .selectAll()
            .data(highlighted_drive.drive_end.team_drives)
            .enter()
            .append("div")
            //.style('color', d => d.color)
            .html(
              (d) =>
                `<i class="fas fa-square" style='margin-right: 4px; color: #${d.team.team_color_primary_hex};'></i>${d.team.school_name} - ${d.points}`
            );
  
          // console.log({xPosition:xPosition, mouse_event:mouse_event, tooltip:tooltip, tooltipLine:tooltipLine, highlighted_drive:highlighted_drive, drives:drives})
        }
      }
      drawChart();
  
    } else {
      var team_seasons = [
        common.render_content.game.home_team_game.team_season,
        common.render_content.game.away_team_game.team_season,
      ];
      var radar_data = team_seasons.map((ts, ind) =>
        [{ axis: "OVR", value: ts.rating.overall, ind: ind }].concat(
          Object.entries(ts.rating.by_position_unit).map((e) => ({
            axis: e[0],
            value: e[1],
            ind: ind,
          }))
        )
      );
  
      var margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width =
          Math.min(700, $("#team-ratings-chart").parent().width() - 10) -
          margin.left -
          margin.right,
        height = 280;
  
      var color = d3
        .scaleOrdinal()
        .range(team_seasons.map((ts) => `#${ts.team.team_color_primary_hex}`)); // CODE FROM http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
      var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 100,
        levels: 10,
        roundStrokes: true,
        color: color,
      };
  
      RadarChart("#team-ratings-chart", radar_data, radarChartOptions);
    }

    await player_face_listeners(common);

  };
  
  function AddScoringSummaryListeners() {
    //  DriveEndingEvent-All
    //  DriveEndingEvent-Score
  
    $(".drive-event-bar button").on("click", function (event, target) {
      var ClickedTab = $(event.target);
      var ClickedTabParent = ClickedTab.attr("id");
      var SelectedEventSelection = ClickedTabParent.replace("-tab", "");
  
      if (!$(ClickedTab).hasClass("selected-bar-button")) {
        $(".selected-bar-button").each(function (ind, obj) {
          $(obj).removeClass("selected-bar-button");
        });
        $(ClickedTab).addClass("selected-bar-button");
      }
  
      $(".DriveEndingEvent-All").each(function (ind, obj) {
        $(obj).addClass("hidden");
      });
  
      $("." + SelectedEventSelection).each(function (ind, obj) {
        $(obj).removeClass("hidden");
      });
    });
  }