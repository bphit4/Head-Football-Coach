import {
    index_group_sync,
    get,
    set,
    distinct,
    sum,
    nest_children,
    intersect,
    set_intersect,
    union,
    set_union,
    except,
    set_except,
    get_from_dict,
    deep_copy,
    ordinal,
  } from "/common/js/utils.js";
  import {nunjucks_env} from '/common/js/nunjucks_tags.js'
  import { draw_player_faces , player_face_listeners} from "/js/faces.js";
  
  export const page_world = async (common) => {
    const db = common.db;
    nunjucks.configure({ autoescape: true });
    const season = common.season;
  
    console.log({
      common: common,
      db: db,
    });
  
    var current_week = db.week.find({ season: { $between: [season - 1, season + 1] } });
    current_week = current_week.find((w) => w.is_current);
  
    const NavBarLinks = await common.nav_bar_links({
      path: "Overview",
      group_name: "World",
      db: db,
    });
  
    common.stopwatch(common, "Time before recent_games");
    const recent_games = common.recent_games(common);
    common.stopwatch(common, "Time after recent_games");
  
    let teams = db.team.find({ team_id: { $gt: 0 } });
    let team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });
    let conferences = db.conference.find();
    let conference_seasons = db.conference_season.find({ season: season });
    let this_week_team_games = db.team_game.find({ week_id: current_week.week_id });
    let this_week_games = db.game.find({ week_id: current_week.week_id });
    let headlines = db.headline.find({ week_id: current_week.week_id - 1 });
  
    var conferences_by_conference_id = index_group_sync(conferences, "index", "conference_id");
  
    var conference_seasons_by_conference_season_id = index_group_sync(
      conference_seasons,
      "index",
      "conference_season_id"
    );
    var team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");
    var team_seasons_by_team_id = index_group_sync(team_seasons, "index", "team_id");
    var teams_by_team_id = index_group_sync(teams, "index", "team_id");
    var distinct_team_seasons = [];
    common.stopwatch(common, "Time after selecting teams");
  
    $.each(teams, async function (ind, team) {
      team.team_season = team_seasons_by_team_id[team.team_id];
      team.team_season.conference_season =
        conference_seasons_by_conference_season_id[team.team_season.conference_season_id];
      team.team_season.conference_season.conference =
        conferences_by_conference_id[team.team_season.conference_season.conference_id];
  
      team.conference_position_display = `${team.team_season.rankings.division_rank[0]} in ${team.team_season.conference_season.conference.conference_abbreviation}`;
      if (team.team_season.results.conference_champion) {
        team.conference_position_display = `${team.team_season.conference_season.conference.conference_abbreviation} Champions`;
      }
    });
  
    teams.sort(function (a, b) {
      if (a.team_season.rankings.national_rank[0] < b.team_season.rankings.national_rank[0])
        return -1;
      if (a.team_season.rankings.national_rank[0] > b.team_season.rankings.national_rank[0]) return 1;
      return 0;
    });
  
    common.stopwatch(common, "Time after sorting team seasons");
  
    var this_week_team_games_by_team_game_id = index_group_sync(
      this_week_team_games,
      "index",
      "team_game_id"
    );
  
    common.stopwatch(common, "Time after fetching team games");
  
    common.stopwatch(common, "Time after fetching games");
  
    var min_national_rank = 0;
    $.each(this_week_games, function (ind, game) {
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
  
      game.home_team_game = this_week_team_games_by_team_game_id[game.home_team_game_id];
      game.away_team_game = this_week_team_games_by_team_game_id[game.away_team_game_id];
  
      game.home_team_game.team_season =
        team_seasons_by_team_season_id[game.home_team_game.team_season_id];
      game.away_team_game.team_season =
        team_seasons_by_team_season_id[game.away_team_game.team_season_id];
  
      game.home_team_game.team_season.stat_rankings = {
        offense: Math.floor(Math.random() * 50),
        defense: Math.floor(Math.random() * 50),
      };
      game.away_team_game.team_season.stat_rankings = {
        offense: Math.floor(Math.random() * 50),
        defense: Math.floor(Math.random() * 50),
      };
  
      game.home_team_game.team_season.team =
        teams_by_team_id[game.home_team_game.team_season.team_id];
      game.away_team_game.team_season.team =
        teams_by_team_id[game.away_team_game.team_season.team_id];
  
      game.team_games = [game.away_team_game, game.home_team_game];
  
      min_national_rank = Math.min(
        game.home_team_game.team_season.national_rank,
        game.away_team_game.team_season.national_rank
      );
      game.summed_national_rank =
        game.home_team_game.team_season.national_rank +
        game.away_team_game.team_season.national_rank +
        min_national_rank;
    });
  
    this_week_games = this_week_games.sort(function (g_a, g_b) {
      if (g_a.team_games[0].team_season.is_user_team || g_a.team_games[1].team_season.is_user_team)
        return -1;
      if (g_b.team_games[0].team_season.is_user_team || g_b.team_games[1].team_season.is_user_team)
        return 1;
      if (g_a.summed_national_rank < g_b.summed_national_rank) return -1;
      if (g_a.summed_national_rank > g_b.summed_national_rank) return 1;
      return 0;
    });
  
    let headline_type_map = {
      game: "Last Week Games",
      ranking: "AP Top 25",
      recruiting: "247 Recruiting",
    };
    headlines.forEach(function (h) {
      h.headline_type_display = headline_type_map[h.headline_type];
      h.team_seasons = h.team_season_ids.map((ts_id) => team_seasons_by_team_season_id[ts_id]);
    });
    headlines = headlines.sort((h_a, h_b) => h_b.headline_relevance - h_a.headline_relevance);
    let headlines_by_headline_type = index_group_sync(headlines, "group", "headline_type_display");
  
    common.stopwatch(common, "Time after this_week_games");
    const page = {
      PrimaryColor: common.primary_color,
      SecondaryColor: common.secondary_color,
      NavBarLinks: NavBarLinks,
      page_title: "Head Football Coach",
    };
    var render_content = {
      team_list: [],
      page: page,
      world_id: common.world_id,
      teams: teams,
      recent_games: recent_games,
      current_week: current_week,
      headlines_by_headline_type: headlines_by_headline_type,
      this_week_games: this_week_games,
    };
  
    common.render_content = render_content;
    window.common = common;
  
    console.log("render_content", render_content);
    console.log({ recent_games: recent_games });
  
    let url = "/html_templates/world/world/template.njk";
    let html = await fetch(url);
    html = await html.text();
  
    let renderedHtml = nunjucks_env.renderString(html, render_content);
  
    $("#body").empty();
    $("#body").append(renderedHtml);
  
    console.log({
      teams: teams,
      this_week_games: this_week_games,
      recent_games: recent_games,
      db:db
    });
  
    let user_team_overview_data = {
      user_team: teams.find((t) => t.is_user_team),
      this_week_game: this_week_games.find(
        (g) => g.team_games[0].team_season.is_user_team || g.team_games[1].team_season.is_user_team
      ),
      last_week_game: recent_games.find(
        (g) => g.team_games[0].team_season.is_user_team || g.team_games[1].team_season.is_user_team
      ),
    };
  
    console.log({teams:teams, db:db, user_team_overview_data: user_team_overview_data });
  
    let preseason_info = {};
    let season_recap = {};
    common.stopwatch(common, "Time before pre-season");
    if (current_week.week_name == "Pre-Season") {
      // TODO filter out backups
      preseason_info.conference_favorites = [];
  
      let team_seasons = db.team_season.find({
        season: { $between: [common.season - 1, common.season] },
        team_id: { $gt: 0 },
      });
      let all_teams = db.team.find();
      let player_team_seasons = db.player_team_season.find({
        season: { $between: [common.season - 1, common.season] },
      });
      let all_preseason_awards = db.award.find({ week_id: current_week.week_id });
  
      const teams_by_team_id = index_group_sync(all_teams, "index", "team_id");
  
      team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  
      const team_seasons_by_team_season_id = index_group_sync(
        team_seasons,
        "index",
        "team_season_id"
      );
  
      common.stopwatch(common, "Time after fetching pre season team_seasons");
  
      player_team_seasons = player_team_seasons.filter((pts) => pts.team_season_id > 0);
      let player_team_season_ids = player_team_seasons.map((pts) => pts.player_team_season_id);
  
      common.stopwatch(common, "Time after fetching pre season pts");
      const player_ids = distinct(player_team_seasons.map((pts) => pts.player_id));
  
      let player_team_season_stats = db.player_team_season_stats.find({
        player_team_season_id: { $in: player_team_season_ids },
      });
      let players = db.player.find({ player_id: { $in: player_ids } });
      let conferences = db.conference.find();
      let conference_seasons = db.conference_season.find({ season: season });
  
      const player_team_season_stats_by_player_team_season_id = index_group_sync(
        player_team_season_stats,
        "index",
        "player_team_season_id"
      );
      common.stopwatch(common, "Time after fetching pre season ptss");
  
      const players_by_player_id = index_group_sync(players, "index", "player_id");
  
      common.stopwatch(common, "Time after fetching pre season players");
  
      player_team_seasons = nest_children(
        player_team_seasons,
        player_team_season_stats_by_player_team_season_id,
        "player_team_season_id",
        "season_stats"
      );
      player_team_seasons = nest_children(
        player_team_seasons,
        team_seasons_by_team_season_id,
        "team_season_id",
        "team_season"
      );
      player_team_seasons = nest_children(
        player_team_seasons,
        players_by_player_id,
        "player_id",
        "player"
      );
  
      let previous_player_team_seasons = player_team_seasons.filter(
        (pts) => pts.season == common.season - 1
      );
  
      player_team_seasons = player_team_seasons.filter((pts) => pts.season == common.season);
      team_seasons = team_seasons.filter((ts) => ts.season == common.season);
  
      let previous_player_team_seasons_by_player_id = index_group_sync(
        previous_player_team_seasons,
        "index",
        "player_id"
      );
      player_team_seasons = nest_children(
        player_team_seasons,
        previous_player_team_seasons_by_player_id,
        "player_id",
        "previous_player_team_season"
      );
      player_team_seasons.forEach(
        (pts) =>
          (pts.previous_player_team_season = pts.previous_player_team_season || {
            player_award_rating: pts.player_award_rating,
          })
      );
  
      common.stopwatch(common, "Time after indexing & filtering players & ptss");
  
      var heisman_race = player_team_seasons.filter((pts) => pts.depth_chart_rank == 1);
      heisman_race = heisman_race.sort(function (pts_a, pts_b) {
        return (
          pts_b.previous_player_team_season.player_award_rating -
          pts_a.previous_player_team_season.player_award_rating
        );
      });
      preseason_info.heisman_hopefuls = heisman_race.slice(0, 5);

      console.log({conferences:conferences, db:db, preseason_info:preseason_info, player_team_seasons:player_team_seasons, heisman_race:heisman_race})
      // debugger;
  
      common.stopwatch(common, "Time after sorting pre season pts");
  
      let conferences_by_conference_id = index_group_sync(conferences, "index", "conference_id");
      conference_seasons = nest_children(
        conference_seasons,
        conferences_by_conference_id,
        "conference_id",
        "conference"
      );
      const team_seasons_by_conference_season_id = index_group_sync(
        team_seasons,
        "group",
        "conference_season_id"
      );
  
      common.stopwatch(common, "Time after fetching pre season conferences");
  
      for (let conference_season of conference_seasons) {
        let team_seasons_for_conference =
          team_seasons_by_conference_season_id[conference_season.conference_season_id];
        team_seasons_for_conference = team_seasons_for_conference.sort(function (ts_a, ts_b) {
          return (
            ts_a.rankings.division_rank[0] - ts_b.rankings.division_rank[0] ||
            ts_a.national_rank - ts_b.national_rank
          );
        });
  
        conference_season.team_seasons = team_seasons_for_conference;
      }
  
      conference_seasons = conference_seasons.sort(
        (cs_a, cs_b) => cs_b.conference.prestige - cs_a.conference.prestige
      );
  
      preseason_info.conference_favorites = conference_seasons;
      render_content.preseason_info = preseason_info;
      url = "/html_templates/world/world/info_col_preseason.njk";
  
      let player_team_seasons_by_player_team_season_id = index_group_sync(
        player_team_seasons,
        "index",
        "player_team_season_id"
      );
      all_preseason_awards = nest_children(
        all_preseason_awards,
        player_team_seasons_by_player_team_season_id,
        "player_team_season_id",
        "player_team_season"
      );
      console.log({
        all_preseason_awards: all_preseason_awards,
        user_team_overview_data: user_team_overview_data,
      });
      let user_team_preseason_awards = all_preseason_awards.filter(
        (a) => a.player_team_season.team_season.team_id == user_team_overview_data.user_team.team_id
      );
  
      user_team_overview_data.preseason_all_conference = user_team_preseason_awards.filter(
        (a) => a.award_team_set == "conference"
      );
      user_team_overview_data.preseason_all_american = user_team_preseason_awards.filter(
        (a) => a.award_team_set == "national"
      );
    } else if (current_week.week_name == "Season Recap") {
      team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
      let team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");
  
      const awards = db.award.find({ season: common.season });
      var heisman_award = awards.find((a) => a.award_group_type == "Heisman");
      let conference_season_poty_awards = awards.filter(
        (a) =>
          a.award_group == "individual" &&
          a.award_timeframe == "regular season" &&
          a.award_team_set == "conference"
      );
  
      let player_team_season_ids = conference_season_poty_awards
        .map((a) => a.player_team_season_id)
        .concat([heisman_award.player_team_season_id]);
      let player_team_seasons = db.player_team_season.find({
        player_team_season_id: { $in: player_team_season_ids },
      });
  
      let player_ids = player_team_seasons.map((pts) => pts.player_id);
  
      let players = db.player.find({ player_id: { $in: player_ids } });
      let player_team_season_stats = db.player_team_season_stats.find({
        player_team_season_id: { $in: player_team_season_ids },
      });
  
      let players_by_player_id = index_group_sync(players, "index", "player_id");
      let player_team_season_stats_by_player_team_season_id = index_group_sync(
        player_team_season_stats,
        "index",
        "player_team_season_id"
      );
      player_team_seasons = nest_children(
        player_team_seasons,
        player_team_season_stats_by_player_team_season_id,
        "player_team_season_id",
        "season_stats"
      );
  
      player_team_seasons = nest_children(
        player_team_seasons,
        players_by_player_id,
        "player_id",
        "player"
      );
      player_team_seasons = nest_children(
        player_team_seasons,
        team_seasons_by_team_season_id,
        "team_season_id",
        "team_season"
      );
      let player_team_seasons_by_player_team_season_id = index_group_sync(
        player_team_seasons,
        "index",
        "player_team_season_id"
      );
  
      heisman_award.player_team_season =
        player_team_seasons_by_player_team_season_id[heisman_award.player_team_season_id];
      conference_season_poty_awards = nest_children(
        conference_season_poty_awards,
        player_team_seasons_by_player_team_season_id,
        "player_team_season_id",
        "player_team_season"
      );
  
      let conference_winning_team_seasons = team_seasons.filter(
        (ts) => ts.results.conference_champion
      );
      let conference_winning_team_seasons_by_conference_season_id = index_group_sync(
        conference_winning_team_seasons,
        "index",
        "conference_season_id"
      );
      let conference_season_ids = conference_winning_team_seasons.map(
        (ts) => ts.conference_season_id
      );
      let conference_seasons = db.conference_season.find({
        conference_season_id: { $in: conference_season_ids },
      });
      let conference_ids = conference_seasons.map((cs) => cs.conference_id);
      let conferences = db.conference.find({ conference_id: { $in: conference_ids } });
      let conferences_by_conference_id = index_group_sync(conferences, "index", "conference_id");
  
      let conference_season_poty_awards_by_conference_season_id = index_group_sync(
        conference_season_poty_awards,
        "index",
        "conference_season_id"
      );
  
      conference_seasons = nest_children(
        conference_seasons,
        conference_season_poty_awards_by_conference_season_id,
        "conference_season_id",
        "poty_award"
      );
      conference_seasons = nest_children(
        conference_seasons,
        conferences_by_conference_id,
        "conference_id",
        "conference"
      );
      // let conference_seasons_by_conference_season_id = index_group_sync(conference_seasons, 'index', 'conference_season_id')
      conference_seasons = nest_children(
        conference_seasons,
        conference_winning_team_seasons_by_conference_season_id,
        "conference_season_id",
        "team_season"
      );
      conference_seasons = conference_seasons.sort((cs_a, cs_b) =>
        cs_b.conference.conference_name > cs_a.conference.conference_name ? -1 : 1
      );
  
      let national_champions_team_season = team_seasons.find((ts) => ts.results.national_champion);
      let champion_other_team_seasons = db.team_season
        .find({ team_id: national_champions_team_season.team_id })
        .filter((ts) => ts.results.national_champion);
      national_champions_team_season.national_championship_count = champion_other_team_seasons.length;
      season_recap.national_champions_team_season = national_champions_team_season;
      season_recap.heisman_award = heisman_award;
      season_recap.conference_seasons = conference_seasons;
  
      render_content.season_recap = season_recap;
      url = "/html_templates/world/world/info_col_season_recap.njk";
    } else {
      url = "/html_templates/world/world/info_col_season.njk";
    }
  
    common.render_content = render_content;
  
    console.log("render_content", render_content);
  
    html = await fetch(url);
    html = await html.text();
  
    renderedHtml = nunjucks_env.renderString(html, render_content);
  
    $("#info-col").html(renderedHtml);
  
    let user_team_url = "/html_templates/world/world/info_col_user_team.njk";
    let user_team__overview_html = await fetch(user_team_url);
    user_team__overview_html = await user_team__overview_html.text();
  
    let user_team_rendered_html = nunjucks_env.renderString(user_team__overview_html, {
      world_id: common.world_id,
      user_team_overview_data: user_team_overview_data,
    });
    $("#user-team-overview").html(user_team_rendered_html);
  
  
    await player_face_listeners(common)
  
  };