const getHtml = async (common) => {
  nunjucks.configure({ autoescape: true });

  var world_obj = {};
  const team_id = parseInt(common.params.team_id);
  const season = common.season;
  const db = common.db;
  const query_to_dict = common.query_to_dict;

  const NavBarLinks = await common.nav_bar_links({
    path: "Depth Chart",
    group_name: "Team",
    db: db,
  });

  const TeamHeaderLinks = await common.team_header_links({
    path: "Depth Chart",
    season: common.params.season,
    db: db,
  });

  var position_list = {
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
    P: 1,
    K: 1,
  };

  let all_pos_stat_list = [
    { display: "GP", key: "season_stats.games.games_played" },
    { display: "GS", key: "season_stats.games.games_started" },
    { display: "Plays", key: "season_stats.games.plays_on_field" },
    { display: "GS", key: "season_stats.games.weighted_game_score" },
  ];

  let all_pos_rating_list = [
    { display: "Awr", key: "ratings.overall.awareness" },
    { display: "Spd", key: "ratings.athleticism.speed" },
    { display: "Acc", key: "ratings.athleticism.acceleration" },
    { display: "Agi", key: "ratings.athleticism.agility" },
    { display: "Jump", key: "ratings.athleticism.jumping" },
    { display: "Str", key: "ratings.athleticism.strength" },
    { display: "Stam", key: "ratings.athleticism.stamina" },
  ];

  let position_depth_chart = [
    {
      position: "QB",
      player_team_seasons: [],
      starter_count: 1,
      stat_list: [
        { display: "Yards", key: "season_stats.passing.yards" },
        { display: "Cmp", key: "season_stats.passing.completions" },
        { display: "Att", key: "season_stats.passing.attempts" },
        { display: "Cmp%", key: "season_stats.passing_completion_percentage" },
        { display: "TDs", key: "season_stats.passing.tds" },
        { display: "Ints", key: "season_stats.passing.ints" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Thr Pw", key: "ratings.passing.throwing_power" },
        { display: "S Acc", key: "ratings.passing.short_throw_accuracy" },
        { display: "M Acc", key: "ratings.passing.medium_throw_accuracy" },
        { display: "D Acc", key: "ratings.passing.deep_throw_accuracy" },
        { display: "Pres.", key: "ratings.passing.throw_under_pressure" },
        { display: "Thr Run", key: "ratings.passing.throw_on_run" },
        { display: "PA", key: "ratings.passing.play_action" },
      ],
    },
    {
      position: "RB",
      player_team_seasons: [],
      starter_count: 1,
      stat_list: [
        { display: "Yards", key: "season_stats.rushing.yards" },
        { display: "Car", key: "season_stats.rushing.carries" },
        { display: "YPC", key: "season_stats.rushing_yards_per_carry" },
        { display: "TDs", key: "season_stats.rushing.tds" },
        { display: "Brkn Tck", key: "season_stats.rushing.broken_tackles" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "Car", key: "ratings.rushing.carrying" },
        { display: "Elu", key: "ratings.rushing.elusiveness" },
        { display: "Brk Tck", key: "ratings.rushing.break_tackle" },
        { display: "BCV", key: "ratings.rushing.ball_carrier_vision" },
      ],
    },
    {
      position: "WR",
      player_team_seasons: [],
      starter_count: 3,
      stat_list: [
        { display: "Yards", key: "season_stats.receiving.yards" },
        { display: "Rec", key: "season_stats.receiving.receptions" },
        { display: "YPC", key: "season_stats.receiving_yards_per_catch" },
        { display: "Targ", key: "season_stats.receiving.targets" },
        { display: "TDs", key: "season_stats.receiving.tds" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Jump", key: "ratings.athleticism.jumping" },
        { display: "Catch", key: "ratings.receiving.catching" },
        { display: "Route", key: "ratings.receiving.route_running" },
        { display: "CiT", key: "ratings.receiving.catch_in_traffic" },
        { display: "Rel", key: "ratings.receiving.release" },
      ],
    },
    {
      position: "TE",
      player_team_seasons: [],
      starter_count: 1,
      stat_list: [
        { display: "Yards", key: "season_stats.receiving.yards" },
        { display: "Rec", key: "season_stats.receiving.receptions" },
        { display: "YPC", key: "season_stats.receiving_yards_per_catch" },
        { display: "Targ", key: "season_stats.receiving.targets" },
        { display: "TDs", key: "season_stats.receiving.tds" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Jump", key: "ratings.athleticism.jumping" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "Catch", key: "ratings.receiving.catching" },
        { display: "Route", key: "ratings.receiving.route_running" },
        { display: "CiT", key: "ratings.receiving.catch_in_traffic" },
        { display: "Rel", key: "ratings.receiving.release" },
        { display: "P Blc", key: "ratings.blocking.pass_block" },
        { display: "R Blc", key: "ratings.blocking.run_block" },
        { display: "Imp Blc", key: "ratings.blocking.impact_block" },
      ],
    },
    {
      position: "OT",
      player_team_seasons: [],
      starter_count: 2,
      stat_list: [
        { display: "Pan", key: "season_stats.blocking.pancakes" },
        { display: "Sack Allowed", key: "season_stats.blocking.sacks_allowed" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "P Blc", key: "ratings.blocking.pass_block" },
        { display: "R Blc", key: "ratings.blocking.run_block" },
        { display: "Imp Blc", key: "ratings.blocking.impact_block" },
      ],
    },
    {
      position: "IOL",
      player_team_seasons: [],
      starter_count: 3,
      stat_list: [
        { display: "Pan", key: "season_stats.blocking.pancakes" },
        { display: "Sack Allowed", key: "season_stats.blocking.sacks_allowed" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "P Blc", key: "ratings.blocking.pass_block" },
        { display: "R Blc", key: "ratings.blocking.run_block" },
        { display: "Imp Blc", key: "ratings.blocking.impact_block" },
      ],
    },
    {
      position: "DL",
      player_team_seasons: [],
      starter_count: 2,
      stat_list: [
        { display: "Tck", key: "season_stats.defense.tackles" },
        { display: "TFL", key: "season_stats.defense.tackles_for_loss" },
        { display: "Sacks", key: "season_stats.defense.sacks" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "Tckl", key: "ratings.defense.tackle" },
        { display: "Hit Pow", key: "ratings.defense.hit_power" },
        { display: "B Shed", key: "ratings.defense.block_shedding" },
        { display: "Purs", key: "ratings.defense.pursuit" },
        { display: "Play rec", key: "ratings.defense.play_recognition" },
        { display: "Pass Rush", key: "ratings.defense.pass_rush" },
      ],
    },
    {
      position: "EDGE",
      player_team_seasons: [],
      starter_count: 2,
      stat_list: [
        { display: "Tck", key: "season_stats.defense.tackles" },
        { display: "TFL", key: "season_stats.defense.tackles_for_loss" },
        { display: "Sacks", key: "season_stats.defense.sacks" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "Tckl", key: "ratings.defense.tackle" },
        { display: "Hit Pow", key: "ratings.defense.hit_power" },
        { display: "B Shed", key: "ratings.defense.block_shedding" },
        { display: "Purs", key: "ratings.defense.pursuit" },
        { display: "Play rec", key: "ratings.defense.play_recognition" },
        { display: "Pass Rush", key: "ratings.defense.pass_rush" },
      ],
    },
    {
      position: "LB",
      player_team_seasons: [],
      starter_count: 3,
      stat_list: [
        { display: "Tck", key: "season_stats.defense.tackles" },
        { display: "TFL", key: "season_stats.defense.tackles_for_loss" },
        { display: "Sacks", key: "season_stats.defense.sacks" },
        { display: "Ints", key: "season_stats.defense.ints" },
        { display: "Defl", key: "season_stats.defense.deflections" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Jump", key: "ratings.athleticism.jumping" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "Tckl", key: "ratings.defense.tackle" },
        { display: "Hit Pow", key: "ratings.defense.hit_power" },
        { display: "B Shed", key: "ratings.defense.block_shedding" },
        { display: "Purs", key: "ratings.defense.pursuit" },
        { display: "Play rec", key: "ratings.defense.play_recognition" },
        { display: "Pass Rush", key: "ratings.defense.pass_rush" },
        { display: "M Cov", key: "ratings.defense.man_coverage" },
        { display: "Z Cov", key: "ratings.defense.zone_coverage" },
      ],
    },
    {
      position: "CB",
      player_team_seasons: [],
      starter_count: 2,
      stat_list: [
        { display: "Tck", key: "season_stats.defense.tackles" },
        { display: "Ints", key: "season_stats.defense.ints" },
        { display: "Defl", key: "season_stats.defense.deflections" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Jump", key: "ratings.athleticism.jumping" },
        { display: "Tckl", key: "ratings.defense.tackle" },
        { display: "B Shed", key: "ratings.defense.block_shedding" },
        { display: "Purs", key: "ratings.defense.pursuit" },
        { display: "Play rec", key: "ratings.defense.play_recognition" },
        { display: "M Cov", key: "ratings.defense.man_coverage" },
        { display: "Z Cov", key: "ratings.defense.zone_coverage" },
        { display: "Press", key: "ratings.defense.press" },
      ],
    },
    {
      position: "S",
      player_team_seasons: [],
      starter_count: 2,
      stat_list: [
        { display: "Tck", key: "season_stats.defense.tackles" },
        { display: "Ints", key: "season_stats.defense.ints" },
        { display: "Defl", key: "season_stats.defense.deflections" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Spd", key: "ratings.athleticism.speed" },
        { display: "Acc", key: "ratings.athleticism.acceleration" },
        { display: "Agi", key: "ratings.athleticism.agility" },
        { display: "Jump", key: "ratings.athleticism.jumping" },
        { display: "Str", key: "ratings.athleticism.strength" },
        { display: "Tckl", key: "ratings.defense.tackle" },
        { display: "Hit Pow", key: "ratings.defense.hit_power" },
        { display: "B Shed", key: "ratings.defense.block_shedding" },
        { display: "Purs", key: "ratings.defense.pursuit" },
        { display: "Play rec", key: "ratings.defense.play_recognition" },
        { display: "M Cov", key: "ratings.defense.man_coverage" },
        { display: "Z Cov", key: "ratings.defense.zone_coverage" },
        { display: "Press", key: "ratings.defense.press" },
      ],
    },
    {
      position: "K",
      player_team_seasons: [],
      starter_count: 1,
      stat_list: [
        { display: "FGM", key: "season_stats.kicking.fgm" },
        { display: "FGA", key: "season_stats.kicking.fga" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Kick Pow", key: "ratings.kicking.kick_power" },
        { display: "Kick Acc", key: "ratings.kicking.kick_accuracy" },
      ],
    },
    {
      position: "P",
      player_team_seasons: [],
      starter_count: 1,
      stat_list: [
        { display: "Punts", key: "season_stats.punting.punts" },
        { display: "Within 20", key: "season_stats.punting.within_20" },
      ],
      rating_list: [
        { display: "Awr", key: "ratings.overall.awareness" },
        { display: "Kick Pow", key: "ratings.kicking.kick_power" },
        { display: "Kick Acc", key: "ratings.kicking.kick_accuracy" },
      ],
    },
  ];

  const league_seasons = await db.league_season.toArray();
  const league_seasons_by_season = index_group_sync(
    league_seasons,
    "index",
    "season"
  );

  const conferences = await db.conference.toArray();
  const conferences_by_conference_id = index_group_sync(
    conferences,
    "index",
    "conference_id"
  );

  var conference_seasons = await db.conference_season.toArray();
  conference_seasons = nest_children(
    conference_seasons,
    conferences_by_conference_id,
    "conference_id",
    "conference"
  );

  const conference_seasons_by_conference_season_id = index_group_sync(
    conference_seasons,
    "index",
    "conference_season_id"
  );

  const team = await db.team.get(team_id);
  var team_season = await db.team_season.get({
    team_id: team_id,
    season: season,
  });

  team.team_season = team_season;
  team.team_season.conference_season =
    conference_seasons_by_conference_season_id[
      team.team_season.conference_season_id
    ];
  team.team_season.conference_season.conference =
    conferences_by_conference_id[
      team.team_season.conference_season.conference_id
    ];

  let player_team_seasons = await db.player_team_season
    .where({ team_season_id: team_season.team_season_id })
    .toArray();
  let player_ids = player_team_seasons.map((pts) => pts.player_id);
  let player_team_season_ids = player_team_seasons.map(
    (pts) => pts.player_team_season_id
  );

  let player_team_season_stats = await db.player_team_season_stats
    .where("player_team_season_id")
    .anyOf(player_team_season_ids)
    .toArray();
  let player_team_season_stats_by_player_team_season_id = index_group_sync(
    player_team_season_stats,
    "index",
    "player_team_season_id"
  );

  let players = await db.player.where("player_id").anyOf(player_ids).toArray();
  let players_by_player_id = index_group_sync(players, "index", "player_id");

  player_team_seasons = nest_children(
    player_team_seasons,
    players_by_player_id,
    "player_id",
    "player"
  );
  player_team_seasons = nest_children(
    player_team_seasons,
    player_team_season_stats_by_player_team_season_id,
    "player_team_season_id",
    "season_stats"
  );
  let player_team_seasons_by_player_team_season_id = index_group_sync(
    player_team_seasons,
    "index",
    "player_team_season_id"
  );

  team.team_season.pts_depth_chart = {};
  position_depth_chart.forEach(function (pos_obj) {
    let pos = pos_obj.position;
    pos_obj.player_team_seasons = team.team_season.depth_chart[pos].map(
      (pts_id) => player_team_seasons_by_player_team_season_id[pts_id]
    );
  });

  console.log({
    TeamHeaderLinks: TeamHeaderLinks,
    team: team,
    position_depth_chart: position_depth_chart,
  });
  common.page = {
    PrimaryColor: team.team_color_primary_hex,
    SecondaryColor: team.secondary_color_display,
    NavBarLinks: NavBarLinks,
    TeamHeaderLinks: TeamHeaderLinks,
  };
  var render_content = {
    page: common.page,
    world_id: common.params["world_id"],
    team_id: team_id,
    team: team,
    season: common.season,
    all_teams: await common.all_teams(common, "/DepthChart/"),
    position_depth_chart: position_depth_chart,
    all_pos_rating_list:all_pos_rating_list,
    all_pos_stat_list:all_pos_stat_list
  };

  common.render_content = render_content;

  console.log("render_content", render_content);

  var url = "/static/html_templates/team/depth_chart/template.njk";
  var html = await fetch(url);
  html = await html.text();

  var renderedHtml = await common.nunjucks_env.renderString(
    html,
    render_content
  );

  $("#body").html(renderedHtml);
};

const reorder_animation = async(common)=> {
  const db = common.db;

  $('.depth-chart-ask-button').on('click', async function(){
    if (confirm("Are you sure you want your assistant to set the depth chart?") == true) {
      window.onbeforeunload = function() {}
      await common.populate_all_depth_charts(common, [common.render_content.team.team_season.team_season_id]);
      location.reload();
    }
  });

  $('.depth-chart-reset-button').on('click', async function(){
    location.reload();
  });

  $('.depth-chart-reorder-icon').click(function(){
    let tbody = $(this).closest('tbody');
    let tr = $(this).closest('tr');
    let tr_index = parseInt($(tr).attr('index'));
    let tr_original_index = parseInt($(tr).attr('original-index'));
    let tr_index_neighbor = 0;

    if ($(this).hasClass('fa-arrow-alt-circle-up')){
      tr_index_neighbor = tr_index-1;
      $(tr).prev().before(tr);
    }
    else {
      tr_index_neighbor = tr_index+1;
      $(tr).next().after(tr);
    }

    let tr_neighbor = $(tbody).find('[index="'+tr_index_neighbor+'"]');
    let tr_neighbor_original_index = parseInt(tr_neighbor.attr('original-index'));

    $(tr).attr('index', tr_index_neighbor);
    $(tr).find('.row-index-td .row-index-span').text(tr_index_neighbor)
    
    $(tr_neighbor).attr('index', tr_index);
    $(tr_neighbor).find('.row-index-td .row-index-span').text(tr_index)

    console.log({this:this, tr_index_neighbor:tr_index_neighbor,tr_index:tr_index, tbody:tbody, tr:tr, tr_neighbor:tr_neighbor })

    let cumulative_change = 0;
    
    $('tr[original-index]').each(function(ind, elem){
      cumulative_change += Math.abs(parseInt($(elem).attr('original-index')) - parseInt($(elem).attr('index')));
      let num_starters = parseInt($(elem).closest('[num-starters]').attr('num-starters'));
      console.log({num_starters:num_starters, "$(elem).attr('index')": $(elem).attr('index')})
      if($(elem).attr('index') <= num_starters){
        $(elem).find('.row-index-td').addClass('bold team-color-font');
      }
      else {
        $(elem).find('.row-index-td').removeClass('bold').removeClass('team-color-font');
      }
    })
    if (cumulative_change > 0){
      $('.depth-chart-save-button').removeClass('disabled');
      $('.depth-chart-reset-button').removeClass('disabled');
    }
    else {
      $('.depth-chart-save-button').addClass('disabled');
      $('.depth-chart-reset-button').addClass('disabled');
    }

    window.onbeforeunload = function() {
      if (cumulative_change > 0){
        return "Depth chart changes not saved. Are you sure?";
      }
      else {}
    };
  })

  $('.depth-chart-save-button').on('click', async function(){
    let pos_depth_chart = {};
    let team_season = common.render_content.team.team_season;
    $('.depth-chart-position-table').each(async function(ind, table){
      console.log({table:table})
      let position = $(table).attr('position');
      let player_rows = $(table).find('.player-depth-chart-row').toArray();
      pos_depth_chart[position] = player_rows.map(elem => $(elem).attr('player_team_season_id'));
    })
    team_season.depth_chart = pos_depth_chart;
    delete team_season.conference_season;
    await db.team_season.put(team_season);

    const toast_template = $('#toast-template');
    const toast_copy = toast_template.clone();
    $(toast_copy).appendTo(toast_template.parent());
    $(toast_copy).attr('id', 'save-toast-'+Date.now())
    $(toast_copy).addClass('bg-success text-white')
    $(toast_copy).find('.toast-body').text('Depth chart saved!')
    const save_complete_toast = new bootstrap.Toast(toast_copy)
    save_complete_toast.show()
    window.onbeforeunload = function() {};
  })
}

const action = async (common) => {
  await common.geo_marker_action(common);

  $(".player-profile-popup-icon").on("click", async function () {
    await common.populate_player_modal(common, this);
  });

  await reorder_animation(common);
};

$(document).ready(async function () {
  var startTime = performance.now();

  const common = await common_functions(
    "/World/:world_id/Team/:team_id/DepthChart/"
  );
  common.startTime = startTime;

  await getHtml(common);
  await action(common);
  await common.add_listeners(common);

  var endTime = performance.now();
  console.log(`Time taken to render HTML: ${parseInt(endTime - startTime)} ms`);
});
