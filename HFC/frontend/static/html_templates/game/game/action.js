const getHtml = async (common) => {
  nunjucks.configure({ autoescape: true });

  var world_obj = {};
  const game_id = parseInt(common.params.game_id);
  const db = common.db;
  const query_to_dict = common.query_to_dict;
  const index_group = common.index_group;

  var game = await db.game.get({game_id: game_id});
  const season = game.season;

  game.week = await db.week.get({week_id: game.week_id});

  game.home_team_game = await db.team_game.get({team_game_id: game.home_team_game_id});
  game.away_team_game = await db.team_game.get({team_game_id: game.away_team_game_id});


  var team_seasons = await db.team_season.bulkGet([game.home_team_game.team_season_id, game.away_team_game.team_season_id]);
  var team_ids = team_seasons.map(ts => ts.team_id);

  var team_seasons_by_team_season_id =  await index_group(team_seasons, 'index', 'team_season_id');
  var teams_by_team_id =  await index_group(await db.team.bulkGet(team_ids), 'index', 'team_id')

  var team_stat_box = []
  var season_stats = []

  $.each(team_seasons_by_team_season_id, function(ind, team_season){
    team_season.team = teams_by_team_id[team_season.team_id];
  });

  game.home_team_game.team_season = team_seasons_by_team_season_id[game.home_team_game.team_season_id];
  game.away_team_game.team_season = team_seasons_by_team_season_id[game.away_team_game.team_season_id];

  console.log('team_seasons_by_team_season_id', team_seasons_by_team_season_id)

  game.game_headline_display = '';
  if (game.bowl != null){
    game.game_headline_display = game.bowl.bowl_name;
  }
  else if (game.rivalry != null) {
    if (game.rivalry.rivalry_name.length > 0){
      game.game_headline_display = game.rivalry.rivalry_name;
    }
    else {
      game.game_headline_display = 'Rivalry Game'
    }
  }

  var player_team_games = await db.player_team_game.where('team_game_id').anyOf([game.home_team_game_id, game.away_team_game_id]).toArray();

  var player_team_seasons = await db.player_team_season.where({season: season}).toArray();
  var player_ids = player_team_seasons.map(pts => pts.player_id);

  var player_team_seasons_by_team_season_id = await index_group(player_team_seasons, 'index', 'player_team_season_id');
  var players_by_player_id = await index_group(await db.player.where('player_id').anyOf(player_ids).toArray(), 'index', 'player_id');

  $.each(player_team_seasons_by_team_season_id, function(ind, player_team_season){
    player_team_season.player = players_by_player_id[player_team_season.player_id];
    player_team_season.team_season = team_seasons_by_team_season_id[player_team_season.team_season_id]
  });

  for (var player_team_game of player_team_games){
    player_team_game.player_team_season = player_team_seasons_by_team_season_id[player_team_game.player_team_season_id]
  }

  const player_team_games_by_team_game_id = index_group_sync(player_team_games, 'group', 'team_game_id');

  for (var team_game_id in player_team_games_by_team_game_id){
    if (team_game_id == game.home_team_game.team_game_id){
      game.home_team_game.player_team_games = player_team_games_by_team_game_id[team_game_id];
    }
    else {
      game.away_team_game.player_team_games = player_team_games_by_team_game_id[team_game_id];
    }
  }


  var positions_to_display = {'QB': 1, 'RB': 1, 'WR': 3, 'TE': 1, 'OT': 2, 'IOL': 3, 'EDGE': 2, 'DL': 2, 'LB': 3, 'CB': 2, 'S': 2}

  var team_game_ids = [];
  var player_talent_comparison = [];

  if (game.was_played) {
    var show_stat_box = true;
    if (game.scoring.final[0] < game.scoring.final[1]) {
      game.home_outcome_letter = 'W';
      game.away_outcome_letter = 'L';

      game.outcome_right_arrow = '<i class="fas fa-angle-right"></i>';
    }
    else {
      game.away_outcome_letter = 'W';
      game.home_outcome_letter = 'L';

      game.outcome_left_arrow = '<i class="fas fa-angle-left"></i>';
    }


    for (const period of game.scoring.periods){
      for (const drive of period.drives) {
        drive.drive_end.display_team = teams_by_team_id[drive.drive_end.display_team_id]

        var seconds_left_in_period = (15 * 60) - (drive.drive_end.seconds_in_to_game % (15 * 60))
        var display_time = seconds_to_time(seconds_left_in_period)
        drive.drive_end.display_time =  display_time

      }
    }


    team_stat_box = [
      {special_format: false, display_name: 'Total Yards', away_value: game.away_team_game.total_yards, home_value: game.home_team_game.total_yards,},
      {special_format: false, display_name: 'First Downs', away_value: game.away_team_game.game_stats.team.downs.first_downs.total, home_value: game.home_team_game.game_stats.team.downs.first_downs.total,},
      {special_format: true,  display_name: 'Time of Possession', away_value: game.away_team_game.game_stats.team.time_of_possession, home_value: game.home_team_game.game_stats.team.time_of_possession, away_display_value: game.away_team_game.time_of_possession_formatted, home_display_value: game.home_team_game.time_of_possession_formatted, },
      {special_format: false, display_name: 'Turnovers', away_value: game.away_team_game.game_stats.team.turnovers, home_value: game.home_team_game.game_stats.team.turnovers,},
      {special_format: false, display_name: 'Sacks', away_value: game.away_team_game.game_stats.defense.sacks, home_value: game.home_team_game.game_stats.defense.sacks,},
      {special_format: false, display_name: 'Punts', away_value: game.away_team_game.game_stats.punting.punts, home_value: game.home_team_game.game_stats.punting.punts,},
      {special_format: true, display_name: 'Third Down Percentage', away_value: game.away_team_game.third_down_conversion_percentage, away_display_value: `${game.away_team_game.third_down_conversion_percentage}%`, home_value: game.home_team_game.third_down_conversion_percentage, home_display_value: `${game.home_team_game.third_down_conversion_percentage}%`},
      {special_format: false, display_name: 'Biggest Lead', away_value: game.away_team_game.game_stats.team.biggest_lead, home_value: game.home_team_game.game_stats.team.biggest_lead,},
    ]

    for (const stat of team_stat_box){
      stat.max_value = Math.max(stat.away_value, stat.home_value)
      stat.home_ratio = stat.home_value / stat.max_value * 100;
      stat.away_ratio = stat.away_value / stat.max_value * 100;

      if (!(stat.special_format)){
        stat.home_display_value = stat.home_value;
        stat.away_display_value = stat.away_value;
      }
    }


  }
  else {
    $.each(positions_to_display, function(pos, count){

      for (var ind = 0; ind < count; ind++){
        position_count = {position: pos}

        position_count.home_player_team_season_id = game.home_team_game.team_season.depth_chart[pos][ind]
        position_count.away_player_team_season_id = game.away_team_game.team_season.depth_chart[pos][ind]

        position_count.home_player_team_season = player_team_seasons_by_team_season_id[position_count.home_player_team_season_id]
        position_count.away_player_team_season = player_team_seasons_by_team_season_id[position_count.away_player_team_season_id]

        if (position_count.home_player_team_season.ratings.overall.overall > position_count.away_player_team_season.ratings.overall.overall){
          position_count.home_player_team_season.advantage_icon = '<i class="fas fa-angle-right"></i>'
          position_count.home_player_team_season.advantage_color = position_count.home_player_team_season.team_season.team.team_color_primary_hex
          position_count.home_player_team_season.advantage_logo_url = position_count.home_player_team_season.team_season.team.team_logo_50;
          if (position_count.home_player_team_season.ratings.overall.overall > position_count.away_player_team_season.ratings.overall.overall * 1.1){
            position_count.home_player_team_season.advantage_icon = '<i class="fas fa-angle-double-right"></i>'
          }
        }
        else if (position_count.home_player_team_season.ratings.overall.overall < position_count.away_player_team_season.ratings.overall.overall) {
          position_count.away_player_team_season.advantage_icon = '<i class="fas fa-angle-left"></i>'
          position_count.away_player_team_season.advantage_color = position_count.away_player_team_season.team_season.team.team_color_primary_hex
          position_count.away_player_team_season.advantage_logo_url = position_count.away_player_team_season.team_season.team.team_logo_50;
          if (position_count.home_player_team_season.ratings.overall.overall < position_count.away_player_team_season.ratings.overall.overall * .9){
            position_count.away_player_team_season.advantage_icon = '<i class="fas fa-angle-double-left"></i>'
          }
        }

        player_talent_comparison.push(position_count)

      }
    });

    //BLOCK OF CODE FOR PAST GAMES
    var all_home_team_seasons = await db.team_season.where({team_id: game.home_team_game.team_season.team_id}).toArray();
    var all_home_team_season_ids = all_home_team_seasons.map(ts => ts.team_season_id);
    var all_home_team_games = await db.team_game.where('team_season_id').anyOf(all_home_team_season_ids).toArray();
    var all_home_game_ids = all_home_team_games.map(tg => tg.game_id);

    var all_away_team_seasons = await db.team_season.where({team_id: game.away_team_game.team_season.team_id}).toArray();
    var all_away_team_season_ids = all_away_team_seasons.map(ts => ts.team_season_id);
    var all_away_team_games = await db.team_game.where('team_season_id').anyOf(all_away_team_season_ids).toArray();
    var all_away_game_ids = all_away_team_games.map(tg => tg.game_id);

    var past_game_ids = intersect(all_home_game_ids, all_away_game_ids)

    var last_team_meetings = await db.game.bulkGet(past_game_ids);
    last_team_meetings = last_team_meetings.filter(g => g.was_played).sort((g_a, g_b) => g_b.week_id - g_a.week_id);

    const last_team_meetings_week_ids = last_team_meetings.map(g => g.week_id);
    const last_team_meetings_weeks = await db.week.bulkGet(last_team_meetings_week_ids);
    const last_team_meetings_weeks_by_week_id = index_group_sync(last_team_meetings_weeks, 'index', 'week_id')

    last_team_meetings = nest_children(last_team_meetings, last_team_meetings_weeks_by_week_id, 'week_id', 'week')

    for (const game of last_team_meetings){
      game.outcome.winning_team.team = teams_by_team_id[game.outcome.winning_team.team_id]
    }


    if (game.home_team_game.team_season.season_stats.games.games_played + game.away_team_game.team_season.season_stats.games.games_played == 0){
      season_stats = []
      show_stat_box = false;
    }
    else {
      var season_stats = [
        {display: 'Points Per Game', attribute: 'points_per_game', better: 'high'},
        {display: 'Points Allowed Per Game', attribute: 'points_allowed_per_game', better: 'low'},
        {display: 'MOV', attribute: 'point_differential_per_game', better: 'high'},
        {display: 'Passing Yards Per Game', attribute: 'passing_yards_per_game', better: 'high'},
        {display: 'Rushing Yards Per Game', attribute: 'rushing_yards_per_game', better: 'high'},
      ]
      show_stat_box = true;
    }
    //BLOCK OF CODE FOR TEAM STATS

    for (const season_stat of season_stats){
      season_stat.home_team_value = get(game.home_team_game.team_season, season_stat.attribute);
      season_stat.away_team_value = get(game.away_team_game.team_season, season_stat.attribute);
      season_stat.max_val = Math.max(season_stat.home_team_value, season_stat.away_team_value);

      if (season_stat.home_team_value > season_stat.away_team_value && season_stat.better == 'high') {
        season_stat.better_team_for_stat = game.home_team_game.team_season.team;
        season_stat.left_arrow = '<i class="fas fa-angle-left"></i>';
      }
      else {
        season_stat.better_team_for_stat = game.away_team_game.team_season.team;
        season_stat.right_arrow = '<i class="fas fa-angle-right"></i>';
      }
    }

    console.log({season_stats:season_stats, last_team_meetings_week_ids:last_team_meetings_week_ids,last_team_meetings_weeks_by_week_id:last_team_meetings_weeks_by_week_id, last_team_meetings:last_team_meetings, past_game_ids:past_game_ids, all_home_team_games:all_home_team_games, all_away_team_games:all_away_team_games})
  }



  const NavBarLinks = await common.nav_bar_links({
    path: 'Game',
    group_name: 'Game',
    db: db
  });

  const conference_standings = [];

  for (const conference_season_id of [...new Set([game.away_team_game.team_season.conference_season_id, game.home_team_game.team_season.conference_season_id])] ){
    var this_conference_standings = await common.conference_standings(conference_season_id, [game.home_team_game.team_season_id, game.away_team_game.team_season_id], common)

     conference_standings.push(this_conference_standings);
  }

  const box_score_stat_groupings = [
    {stat_group_name: 'Passing', filter_key: 'game_stats.passing.attempts', order: [[ 1 + 1, "desc" ]], columns: [
                                                                                        {title: 'YRD', data: 'game_stats.passing.yards'},
                                                                                        {title: 'CMP', data: 'game_stats.passing.completions'},
                                                                                        {title: 'ATT', data: 'game_stats.passing.attempts'},
                                                                                        {title: 'YPA', data: 'passing_yards_per_attempt'},
                                                                                        {title: 'TD', data: 'game_stats.passing.tds'},
                                                                                        {title: 'INT', data: 'game_stats.passing.ints'},
                                                                                      ]},
    {stat_group_name: 'Rushing', filter_key: 'game_stats.rushing.carries', order: [[ 1 + 1, "desc" ]], columns: [
                                                                                        {title: 'CAR', data: 'game_stats.rushing.carries'},
                                                                                        {title: 'YRD', data: 'game_stats.rushing.yards'},
                                                                                        {title: 'YPC', data: 'rushing_yards_per_carry_qualified'},
                                                                                        {title: 'TD', data: 'game_stats.rushing.tds'},
                                                                                        {title: 'LNG', data: 'game_stats.rushing.lng'},
                                                                                      ]},
    {stat_group_name: 'Receiving', filter_key: 'game_stats.receiving.receptions', order: [[ 1 + 1, "desc" ]], columns: [
                                                                                        {title: 'REC', data: 'game_stats.receiving.receptions'},
                                                                                        {title: 'YRD', data: 'game_stats.receiving.yards'},
                                                                                        {title: 'YPC', data: 'receiving_yards_per_catch'},
                                                                                        {title: 'TD', data: 'game_stats.receiving.tds'},
                                                                                        {title: 'LNG', data: 'game_stats.receiving.lng'},
                                                                                      ]},
    {stat_group_name: 'Defense', filter_key: 'defense_action_count', order: [[ 2 + 1, "desc" ]], columns: [
                                                                                        {title: 'TCK', data: 'game_stats.defense.tackles'},
                                                                                        {title: 'TFL', data: 'game_stats.defense.tackles_for_loss'},
                                                                                        {title: 'SACK', data: 'game_stats.defense.sacks'},
                                                                                        {title: 'INT', data: 'game_stats.defense.ints'},
                                                                                      ]},
  ]

  console.log('conference_standings', conference_standings)

  common.page = {PrimaryColor: '1763B2', SecondaryColor: '000000', NavBarLinks: NavBarLinks};
  var render_content = {
                        page:     common.page,
                        world_id: common.params.world_id,
                        game: game,
                        player_talent_comparison:player_talent_comparison,
                        conference_standings: conference_standings,
                        show_stat_box: show_stat_box,
                        team_stat_box: team_stat_box,
                        box_score_stat_groupings: box_score_stat_groupings,
                        last_team_meetings:last_team_meetings,
                        season_stats:season_stats
                      }

  common.render_content = render_content;

  await console.log('render_content', render_content)

  var url = '/static/html_templates/game/game/template.html'
  var html = await fetch(url);
  html = await html.text();

  var renderedHtml = await common.nunjucks_env.renderString(html, render_content)

  $('#body').html(renderedHtml);


  common.calculate_team_overalls(common);

}

    const action = async (common) => {

      if (common.render_content.game.was_played){
        const drives = common.render_content.game.scoring.drives;
        console.log('drives', drives)

        const game = common.render_content.game;

        var scoring_data = [
          {
            name: game.home_team_game.team_season.team.school_name,
            show: true,
            color: '#'+game.home_team_game.team_season.team.team_color_primary_hex,
            final_score: game.home_team_game.points,
            drives: drives.map(d => ({seconds_in_to_game: d.drive_end.seconds_in_to_game, points:  d.drive_end.home_team_points}))
          },
          {
            name: game.away_team_game.team_season.team.school_name,
            show: true,
            color: '#'+game.away_team_game.team_season.team.team_color_primary_hex,
            final_score: game.away_team_game.points,
            drives: drives.map(d => ({seconds_in_to_game: d.drive_end.seconds_in_to_game, points:  d.drive_end.away_team_points}))
          }
        ]

        var max_time = drives.map(d => d.drive_end.seconds_in_to_game).reduce((acc, val) => Math.max(acc, val), 0);
        var max_points = drives.map(d => Math.max(d.drive_end.away_team_points, d.drive_end.home_team_points)).reduce((acc, val) => Math.max(acc, val), 0);
        max_points = Math.ceil(max_points / 5) * 5;

        console.log({scoring_data:scoring_data, drives:drives, max_time:max_time, max_points:max_points})



        function drawChart() {

            // Define margins, dimensions, and some line colors
            const margin = {top: 40, right: 120, bottom: 30, left: 40};
            const width = $('#GameFlowChart').width() - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            // Define the scales and tell D3 how to draw the line
            const x = d3.scaleLinear().domain([0, max_time]).range([0, width]);
            const y = d3.scaleLinear().domain([0, max_points]).range([height, 0]);
            const line = d3.line().x(function(d){
              console.log({d:d})
              return x(d.seconds_in_to_game);
            }).y(d => y(d.points));

            const chart = d3.select('#GameFlowChart').append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            const tooltip = d3.select('#tooltip');
            const tooltipLine = chart.append('line');

            // Add the axes and a title
            const xAxis = d3.axisBottom(x).tickFormat(d3.format('.4'));
            const yAxis = d3.axisLeft(y).tickFormat(d3.format('.2s'));
            chart.append('g').call(yAxis);
            chart.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis);
            chart.append('text').html('State Population Over Time').attr('x', 200);

            // Load the data and draw a chart
            let states, tipBox;

            chart.selectAll()
              .data(scoring_data).enter()
              .append('path')
              .attr('fill', 'none')
              .attr('stroke', d => d.color)
              .attr('stroke-width', 2)
              .datum(function(d){
                return d.drives;
              })
              .attr('d', line);

            chart.selectAll()
              .data(scoring_data).enter()
              .append('text')
              .html(d => d.name)
              .attr('fill', d => d.color)
              .attr('alignment-baseline', 'middle')
              .attr('x', width)
              .attr('dx', '.5em')
              .attr('y', d => y(d.final_score));

            tipBox = chart.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('opacity', 0)
              .on('mousemove', drawTooltip)
              .on('mouseout', removeTooltip);

            function removeTooltip() {
            if (tooltip) tooltip.style('display', 'none');
            if (tooltipLine) tooltipLine.attr('stroke', 'none');
            }

            function drawTooltip(mouse_event) {
            var xPosition = x.invert(mouse_event.layerX),
                bisect = d3.bisector(function(d) { return d.seconds_in_to_game; }).right,
                idx = bisect(scoring_data[0].drives, xPosition, 1),
                seconds_in_to_game = scoring_data[0].drives[idx].seconds_in_to_game;

            console.log({xPosition:xPosition,seconds_in_to_game:seconds_in_to_game,  mouse_event:mouse_event, bisect:bisect, idx:idx})

            scoring_data.sort((a, b) => {
              return b.drives.find(d => d.seconds_in_to_game == seconds_in_to_game).points - a.drives.find(d => d.seconds_in_to_game == seconds_in_to_game).points;
            })

            tooltipLine.attr('stroke', 'black')
              .attr('x1', x(seconds_in_to_game))
              .attr('x2', x(seconds_in_to_game))
              .attr('y1', 0)
              .attr('y2', height);

            tooltip.html(seconds_in_to_game)
              .style('display', 'block')
              .style('left', mouse_event.x + 20)
              .style('top', mouse_event.y - 20)
              .selectAll()
              .data(scoring_data).enter()
              .append('div')
              .style('color', d => d.color)
              .html(d => d.name + ': ' + d.drives.find(d => d.seconds_in_to_game == seconds_in_to_game).points);
            }
}
        drawChart()

      }
      else {
        var team_seasons = [common.render_content.game.home_team_game.team_season, common.render_content.game.away_team_game.team_season]
        var radar_data = team_seasons.map((ts, ind) => ([{axis:'OVR', value: ts.rating.overall, ind:ind}]).concat(Object.entries(ts.rating.by_position_unit).map(e => ({axis: e[0], value: e[1], ind:ind}))));
        console.log({radar_data:radar_data})

        var margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = Math.min(700, $('#team-ratings-chart').parent().width() - 10) - margin.left - margin.right,
        height = 280;

        console.log({d3:d3});
        var color = d3.scaleOrdinal()
  				.range(team_seasons.map(ts => `#${ts.team.team_color_primary_hex}`)); // CODE FROM http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
        var radarChartOptions = {
  			  w: width,
  			  h: height,
  			  margin: margin,
  			  maxValue: 100,
  			  levels: 10,
  			  roundStrokes: true,
  			  color: color
  			};

        RadarChart("#team-ratings-chart", radar_data, radarChartOptions);
      }


    }



    function AddScoringSummaryListeners(){

      //  DriveEndingEvent-All
      //  DriveEndingEvent-Score

      $('.drive-event-bar button').on('click', function(event, target) {

        var ClickedTab = $(event.target)
        console.log('ClickedTab', ClickedTab);
        var ClickedTabParent = ClickedTab.attr('id');
        var SelectedEventSelection = ClickedTabParent.replace('-tab', '');

        if (! $(ClickedTab).hasClass('selected-drive-event-tab')) {
          $('.selected-drive-event-tab').each(function(ind, obj){
            $(obj).removeClass('selected-drive-event-tab');
          })
          $(ClickedTab).addClass('selected-drive-event-tab');
        }

        $('.DriveEndingEvent-All').each(function(ind, obj){
          $(obj).addClass('w3-hide');
        });

        $('.' + SelectedEventSelection).each(function(ind, obj){
          $(obj).removeClass('w3-hide');
        });

      });
    }


const draw_box_score = (common) => {

  const game = common.render_content.game;

  console.log({'home_team_game.player_team_games':common.render_content});

  const desc_first = ['desc', 'asc'];


  var box_score_clicked = false;
  $('#nav-boxscore-tab').on('click', function(){
    console.log('CLICKED ON #nav-boxscore-tab')
    if (box_score_clicked == true) {
      return false;
    }
    box_score_clicked = true;

    var base_column_config = {"sortable": true, 'className': 'center-text ','visible': true, 'orderSequence':desc_first};

    var base_datatable_config = {
        dom: 't',
        ordering: true,
        columns: [
          {title: 'Name', "data": "player_team_season.player.full_name", "sortable": true, 'className': 'left-text ','visible': true, 'orderSequence':desc_first, "fnCreatedCell": function (td, full_name, player_team_game, iRow, iCol) {
            $(td).html(`<a href='${player_team_game.player_team_season.player.player_href}'>
              <span>${full_name}<span>
              <span class='font10'>${player_team_game.player_team_season.position}<span>
            </a>`)
          }},
        ],
    }

    for (const stat_grouping of common.render_content.box_score_stat_groupings){
      console.log({stat_grouping:stat_grouping})

      var stat_grouping_config = deep_copy(base_datatable_config)

      for (const stat of stat_grouping.columns){
        var stat_column_config = deep_copy(base_column_config)
        stat_column_config.title = stat.title;
        stat_column_config.data = stat.data;

        stat_grouping_config.columns.push(stat_column_config)
      }

      console.log({stat_grouping_config:stat_grouping_config, stat_column_config:stat_column_config})
      var home_base_datatable_config = deep_copy(stat_grouping_config)
      var away_base_datatable_config = deep_copy(stat_grouping_config)

      home_base_datatable_config.data = game.home_team_game.player_team_games.filter(ptg => get(ptg, stat_grouping.filter_key) > 0)
      away_base_datatable_config.data = game.away_team_game.player_team_games.filter(ptg => get(ptg, stat_grouping.filter_key) > 0)

      home_base_datatable_config.order = stat_grouping.order;
      away_base_datatable_config.order = stat_grouping.order;


      $(`#home-box-score-${stat_grouping.stat_group_name}`).DataTable(home_base_datatable_config);
      $(`#away-box-score-${stat_grouping.stat_group_name}`).DataTable(away_base_datatable_config);
    }



  })
}



$(document).ready(async function(){
  var startTime = performance.now()

  const common = await common_functions('/World/:world_id/Game/:game_id/');

  await getHtml(common);
  await action(common);
  await common.add_listeners(common);
  await draw_box_score(common);
  await AddScoringSummaryListeners();

  var endTime = performance.now()
  console.log(`Time taken to render HTML: ${parseInt(endTime - startTime)} ms` );

})
