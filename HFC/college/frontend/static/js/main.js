import { nunjucks_env } from '../../../../../../../../../common/js/nunjucks_tags.js';
import { round_decimal, index_group_sync, nest_children, average, weighted_random_choice, get, distinct, deep_copy, normal_trunc, shuffle, sum, normal_trunc_bounce, set_intersect } from '../../../../../../../../../common/js/utils.js';
import { init_basic_table_sorting } from '../../../../../../../../../common/js/football-table/football-table.js';
import { award, team_game, conference, league_season, team, team_season, team_season_stats, recruit_team_season, coach, coach_team_season, player, player_team_season, player_team_season_stats, player_team_game } from '../../../../../../../../../js/schema.js';
import { driver_db, resolve_db, create_new_db } from '../../../../../../../../../js/database.js';
import { page_world, page_world_rankings, page_world_standings, page_world_schedule, page_world_awards } from '../../../../../../../../../js/pages/world_pages.js';
import { page_team, page_team_schedule, page_team_roster, page_team_history } from '../../../../../../../../../js/pages/team_pages.js';
import { page_player } from '../../../../../../../../../js/pages/player_pages.js';
import { page_almanac_player_stats, page_almanac_history, page_almanac_player_records } from '../../../../../../../../../js/pages/almanac_pages.js';
import { page_game } from '../../../../../../../../../js/pages/game_pages.js';
import { page_index } from '../../../../../../../../../js/pages/index_pages.js';
import { position_group_map } from '../../../../../../../../../js/metadata.js';
import { generate_ranking_headlines } from '../../../../../../../../../js/headlines.js';
import { sim_game } from '../../../../../../../../../js/sim_game.js';
import { player_face_listeners, draw_player_faces } from '../../../../../../../../../js/faces.js';

const nav_bar_links = async (params) => {
  const path = params.path;
  const group_name = params.group_name;
  const db = params.db;

  const league_seasons = db.league_season.find();
  const current_league_season = league_seasons.find((ls) => ls.is_current_season);
  console.log({
    db: db,
    league_seasons: league_seasons,
    current_league_season: current_league_season,
  });
  const season = current_league_season.season;
  const world_id = current_league_season.world_id;

  let phases = db.phase.find({ season: season });
  let weeks = db.week.find({ season: season });
  let user_team = db.team.findOne({ team_id: current_league_season.user_team_id });

  const phases_by_phase_id = index_group_sync(phases, "index", "phase_id");

  const current_week = weeks.filter((week) => week.is_current)[0];
  console.log({
    weeks: weeks,
    current_week: current_week,
    season: season,
    phases_by_phase_id: phases_by_phase_id,
  });
  current_week.phase = phases_by_phase_id[current_week.phase_id];
  current_week.league_season = current_league_season;

  const team_id = user_team.team_id;
  const user_team_logo = user_team.team_logo;

  var can_sim = true,
    save_ls = true;

  var user_actions = [];

  var sim_action_week = {
    LinkDisplay: "Sim This Week",
    id: "SimThisWeek",
    Href: "",
    ClassName: "sim-action",
  };
  var sim_action_phase = {
    LinkDisplay: "Sim This Phase",
    id: "SimThisPhase",
    Href: "",
    ClassName: "sim-action",
  };

  if (current_week != null) {
    if (current_week.phase.phase_name == "Pre-Season") {
      can_sim = true;
      save_ls = true;

      //Check for user team needing to cut players
      if (!current_league_season.preseason_tasks.user_cut_players) {
        if (user_team.player_count > current_league_season.players_per_team) {
          user_actions.push({
            LinkDisplay: "Cut Players",
            Href: `/World/${world_id}/Team/${team_id}/Roster`,
            ClassName: "",
          });
          can_sim = false;
        } else {
          current_league_season.preseason_tasks.user_cut_players = true;
          save_ls = true;
        }
      }

      //Check for user team needing captains
      if (user_team.captain_count < current_league_season.captains_per_team) {
        user_actions.push({
          LinkDisplay: "Set Captains",
          Href: `/World/${world_id}/Team/${team_id}/Roster`,
          ClassName: "",
        });
        can_sim = false;
      }

      //Check for user team needing gameplan
      if (!current_league_season.preseason_tasks.user_set_gameplan) {
        user_actions.push({
          LinkDisplay: "Set Gameplan",
          Href: `/World/${world_id}/Team/${team_id}/Gameplan`,
          ClassName: "",
        });
        can_sim = false;
      }

      //Check for user team needing gameplan
      if (!current_league_season.preseason_tasks.user_set_depth_chart) {
        user_actions.push({
          LinkDisplay: "Set Depth Chart",
          Href: `/World/${world_id}/Team/${team_id}/DepthChart`,
          ClassName: "",
        });
        can_sim = false;
      }

      can_sim = true; //TODO - change back!
      if (!can_sim) {
        sim_action_week.ClassName += " w3-disabled";
        sim_action_phase.ClassName += " w3-disabled";
      }

      if (save_ls) {
        db.league_season.update(current_league_season);
        await db.saveDatabaseAsync();
      }
    } else if (current_week.phase.phase_name == "Season Recap") {
      user_actions.push({
        LinkDisplay: "View Season Awards",
        Href: `/World/${world_id}/Awards`,
        ClassName: "",
      });
    } else if (current_week.phase.phase_name == "Coach Carousel") {
      user_actions.push({
        LinkDisplay: "View Coach Carousel",
        Href: `/World/${world_id}/CoachCarousel`,
        ClassName: "",
      });
    } else if (current_week.phase.phase_name == "Draft Departures") {
      user_actions.push({
        LinkDisplay: "View Player Departures",
        Href: `/World/${world_id}/PlayerDepartures`,
        ClassName: "",
      });
    } else if (current_week.phase.phase_name == "National Signing Day") {
      user_actions.push({
        LinkDisplay: "View Recruiting Board",
        Href: `/World/${world_id}/Recruiting`,
        ClassName: "",
      });
    } else if (current_week.phase.phase_name == "Prepare for Summer Camps") {
      user_actions.push({
        LinkDisplay: "Set Player Development",
        Href: `/World/${world_id}/PlayerDevelopment`,
        ClassName: "",
      });
    }

    sim_action_phase.LinkDisplay = "Sim to end of " + current_week.phase.phase_name;
    user_actions.unshift(sim_action_phase);

    if (current_week.user_recruiting_points_left_this_week > 0) {
      user_actions.push({
        LinkDisplay: `Weekly Recruiting ${current_week.user_recruiting_points_left_this_week}`,
        Href: `/World/${world_id}/Recruiting`,
        ClassName: "",
      });
    }

    if (!current_week.last_week_in_phase) {
      user_actions.unshift(sim_action_week);
    }

    const week_updates = current_week.week_updates;
    if (week_updates.length > 0) {
      user_actions.push({
        LinkDisplay: `Updates this week ${week_updates.length}`,
        id: "WeekUpdates",
        Href: "#",
        ClassName: "week-updates",
      });
    }
  }

  can_sim = true; //TODO - Change back!!
  const LinkGroups = [
    {
      GroupName: "Action",
      GroupDisplay: `${current_week.week_name}, ${season}`,
      GroupLinks: user_actions,
    },
    {
      GroupName: "World",
      GroupDisplay: '<img src="/img/team_logos/ncaa-text.png" class="" alt="">',
      GroupLinks: [
        {
          LinkDisplay: "Overview",
          id: "",
          Href: `/World/${world_id}`,
          ClassName: "",
        },
        {
          LinkDisplay: "Standings",
          id: "",
          Href: `/World/${world_id}/Standings`,
          ClassName: "",
        },
        {
          LinkDisplay: "Rankings",
          id: "",
          Href: `/World/${world_id}/Rankings`,
          ClassName: "",
        },
        {
          LinkDisplay: "Schedule",
          id: "",
          Href: `/World/${world_id}/Schedule`,
          ClassName: "",
        },
        {
          LinkDisplay: "Headline",
          id: "",
          Href: `/World/${world_id}/Headlines`,
          ClassName: "",
        },
        {
          LinkDisplay: "Recruiting",
          id: "",
          Href: `/World/${world_id}/Recruiting`,
          ClassName: "",
        },
        {
          LinkDisplay: "Awards & Races",
          id: "",
          Href: `/World/${world_id}/Awards`,
          ClassName: "",
        },
      ],
    },
    {
      GroupName: "Team",
      GroupDisplay: `<img src="${user_team_logo}" class="" alt="">`,
      GroupLinks: [
        {
          LinkDisplay: "Overview",
          id: "",
          Href: `/World/${world_id}/Team/${team_id}`,
          ClassName: "",
        },
        {
          LinkDisplay: "Schedule",
          id: "",
          Href: `/World/${world_id}/Team/${team_id}/Schedule`,
          ClassName: "",
        },
        {
          LinkDisplay: "Roster",
          id: "",
          Href: `/World/${world_id}/Team/${team_id}/Roster`,
          ClassName: "",
        },
        {
          LinkDisplay: "Depth Chart",
          id: "",
          Href: `/World/${world_id}/Team/${team_id}/DepthChart`,
          ClassName: "",
        },
        {
          LinkDisplay: "Gameplan",
          id: "",
          Href: `/World/${world_id}/Team/${team_id}/Gameplan`,
          ClassName: "",
        },
        {
          LinkDisplay: "Coaches",
          id: "",
          Href: `/World/${world_id}/Coaches/Team/${team_id}`,
          ClassName: "",
        },
        {
          LinkDisplay: "Player Development",
          id: "",
          Href: `/World/${world_id}/PlayerDevelopment/Team/${team_id}`,
          ClassName: "",
        },
        {
          LinkDisplay: "History",
          id: "",
          Href: `/World/${world_id}/Team/${team_id}/History`,
          ClassName: "",
        },
      ],
    },
    {
      GroupName: "Almanac",
      GroupDisplay: "Almanac",
      GroupLinks: [
        {
          LinkDisplay: "History",
          id: "",
          Href: `/World/${world_id}/History`,
          ClassName: "",
        },
        {
          LinkDisplay: "Player Stats",
          id: "",
          Href: `/World/${world_id}/PlayerStats/Season/${season}`,
          ClassName: "",
        },
        {
          LinkDisplay: "Player Records",
          id: "",
          Href: `/World/${world_id}/PlayerRecords`,
          ClassName: "",
        },
        {
          LinkDisplay: "Team Stats",
          id: "",
          Href: `/World/${world_id}/TeamStats/Season/${season}`,
          ClassName: "",
        },
        {
          LinkDisplay: "Team Records",
          id: "",
          Href: `/World/${world_id}/TeamRecords`,
          ClassName: "",
        },
        {
          LinkDisplay: "Hall of Fame",
          id: "",
          Href: `/World/${world_id}/HallOfFame`,
          ClassName: "",
        },
        {
          LinkDisplay: "Amazing Stats",
          id: "",
          Href: `/World/${world_id}/AmazingStats`,
          ClassName: "",
        },
        {
          LinkDisplay: "Coach Stats",
          id: "",
          Href: `/World/${world_id}/Coaches`,
          ClassName: "",
        },
        {
          LinkDisplay: "Shortlists",
          id: "",
          Href: `/World/${world_id}/Shortlists`,
          ClassName: "",
        },
        {
          LinkDisplay: "Search",
          id: "nav-search",
          Href: "#",
          ClassName: "w3-input",
          world_id: world_id,
        },
      ],
    },
    {
      GroupName: "Game",
      GroupDisplay: "Game",
      GroupLinks: [
        { LinkDisplay: "Home Page", id: "", Href: "/", ClassName: "" },
        { LinkDisplay: "Admin", id: "", Href: "/admin", ClassName: "" },
        { LinkDisplay: "Audit", id: "", Href: "/audit", ClassName: "" },
        { LinkDisplay: "Credits", id: "", Href: "/Credits", ClassName: "" },
        {
          LinkDisplay: "Acheivements",
          id: "",
          Href: "/Acheivements",
          ClassName: "",
        },
      ],
    },
  ];

  $.each(LinkGroups, function (ind, Group) {
    $.each(Group.GroupLinks, function (ind, Link) {
      if (Link["LinkDisplay"] == path && Group["GroupName"] == group_name) {
        Link["ClassName"] = "Selected";
      }
    });
  });

  can_sim = true; //TODO - Change back!!
  var SimActionStatus = { CanSim: can_sim, LinkGroups: [] };
  SimActionStatus["LinkGroups"] = LinkGroups;
  return SimActionStatus;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const distance_between_cities = (city_a, city_b, distance_tracking_map = {}) => {
  let city_a_str = `${Math.round(city_a.lat, 1)},${Math.round(city_a.long, 1)}`;
  let city_b_str = `${Math.round(city_b.lat, 1)},${Math.round(city_b.long, 1)}`;
  let city_arr = [city_a_str, city_b_str].sort();

  // Serialize the locations and short-circuit if we've already calculated the disance.
  if (distance_tracking_map[city_arr[0]] && distance_tracking_map[city_arr[0]][city_arr[1]]) {
    return distance_tracking_map[city_arr[0]][city_arr[1]];
  }

  var earth_radius = 6371; // Radius of the earth in km
  var dLat = deg2rad(city_a.lat - city_b.lat); // deg2rad below
  var dLon = deg2rad(city_a.long - city_b.long);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(city_a.lat)) *
      Math.cos(deg2rad(city_b.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = earth_radius * c; // Distance in km
  d = d / 1.609344;

  if (!distance_tracking_map[city_arr[0]]) {
    distance_tracking_map[city_arr[0]] = {};
  }
  distance_tracking_map[city_arr[0]][city_arr[1]] = d;

  if (!distance_tracking_map[city_arr[1]]) {
    distance_tracking_map[city_arr[1]] = {};
  }
  distance_tracking_map[city_arr[1]][city_arr[0]] = d;

  return d;
};

const distance_between_coordinates = (coord_a, coord_b) => {
  var earth_radius = 6371; // Radius of the earth in km
  var dLat = deg2rad(coord_a[0] - coord_b[0]); // deg2rad below
  var dLon = deg2rad(coord_a[1] - coord_b[1]);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord_a[0])) *
      Math.cos(deg2rad(coord_b[0])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = earth_radius * c; // Distance in km
  d = d / 1.609344;
  return d;
};

const initialize_new_season = async (this_week, common) => {
  const db = common.db;
  const current_season = this_week.season;
  var current_league_season = db.league_season.findOne({ season: current_season });

  const new_season = current_season + 1;

  stopwatch(common, "Init New Season - Starting");

  stopwatch(common, "Init New Season - Deleted existing data");

  common.season = new_season;
  const world_id = common.world_id;

  const teams = db.team.find({"team_id": {'$gt': 0}});

  const num_teams = teams.length;

  const new_season_data = {
    season: new_season,
    world_id: world_id,
    captains_per_team: 3,
    players_per_team: 75,
    num_teams: num_teams,
    league_style: "traditional", // traditional, regional
  };
  const new_season_obj = new league_season(new_season_data, current_league_season);

  stopwatch(common, "Init New Season - New season info");

  console.log({ new_season_obj: new_season_obj });
  db.league_season.insert(new_season_obj);

  await db.saveDatabaseAsync();

  const phases_created = await create_phase(new_season, common);
  await create_week(phases_created, common, world_id, new_season);

  stopwatch(common, "Init New Season - Created phases & weeks");

  var conferences = db.conference.find();
  await common.create_conference_seasons({
    common: common,
    conferences: conferences,
    season: new_season,
    world_id: world_id,
  });
  var conference_seasons = index_group_sync(
     db.conference_season.find({ season: new_season }),
    "index",
    "conference_id"
  );

  conferences = nest_children(
    conferences,
    conference_seasons,
    "conference_id",
    "conference_season"
  );
  var conference_by_conference_name = index_group_sync(conferences, "index", "conference_name");

  await create_team_season({
    common: common,
    season: new_season,
    world_id: world_id,
    conferences_by_conference_name: conference_by_conference_name,
  });

  stopwatch(common, "Init New Season - Created conferences");

  const all_weeks = db.week.find({ season: new_season });
  const next_week = all_weeks[0];

  next_week.phase = db.phase.findOne({ phase_id: this_week.phase_id });
  next_week.phase.season = new_season;

  console.log("this_week", next_week, all_weeks, common);

  var team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });
  const teams_by_team_id = index_group_sync(
    db.team.find({ team_id: { $gt: 0 } }),
    "index",
    "team_id"
  );

  stopwatch(common, "Init New Season - Fetched TSs");

  let [players, previous_team_seasons, previous_player_team_seasons] = await Promise.all([
    db.player.find(),
    db.team_season.find({ season: current_season, team_id: { $gt: 0 } }),
    db.player_team_season.find({ season: current_season }),
  ]);
  previous_team_seasons = nest_children(previous_team_seasons, teams_by_team_id, "team_id", "team");
  let previous_team_seasons_by_team_season_id = index_group_sync(
    previous_team_seasons,
    "index",
    "team_season_id"
  );

  let previous_player_team_season_ids = previous_player_team_seasons.map(
    (pts) => pts.player_team_season_id
  );
  const previous_player_team_season_stats = db.player_team_season_stats
    .find({"player_team_season_id": {'$in': previous_player_team_season_ids}});

  let previous_player_team_season_stats_by_player_team_season_id = index_group_sync(
    previous_player_team_season_stats,
    "index",
    "player_team_season_id"
  );
  previous_player_team_seasons = nest_children(
    previous_player_team_seasons,
    previous_player_team_season_stats_by_player_team_season_id,
    "player_team_season_id",
    "season_stats"
  );
  previous_player_team_seasons = nest_children(
    previous_player_team_seasons,
    previous_team_seasons_by_team_season_id,
    "team_season_id",
    "team_season"
  );

  const previous_player_team_seasons_by_player_id = index_group_sync(
    previous_player_team_seasons,
    "index",
    "player_id"
  );
  players = nest_children(
    players,
    previous_player_team_seasons_by_player_id,
    "player_id",
    "previous_player_team_season"
  );
  players = players.filter((p) => p.previous_player_team_season != undefined);

  stopwatch(common, "Init New Season - Fetched Players");

  await advance_player_team_seasons({
    common: common,
    players: players,
    previous_team_seasons: previous_team_seasons,
    team_seasons: team_seasons,
    world_id: world_id,
    season: new_season,
  });

  stopwatch(common, "Init New Season - Created PTSs");

  await assign_player_jersey_numbers(common, new_season);

  stopwatch(common, "Init New Season - Assigned Jersey Numbers");

  await create_new_players_and_player_team_seasons(common, world_id, new_season, team_seasons, [
    "HS SR",
  ]);

  stopwatch(common, "Init New Season - Created New High Schoolers");

  await generate_player_ratings(common, world_id, new_season);

  stopwatch(common, "Init New Season - Updated PTS ratings");

  let coaches = db.coach.find(); //TODO - I'll regret this once players graduate & start fresh

  let previous_coach_team_seasons = db.coach_team_season.find({ season: current_season });
  previous_coach_team_seasons.map(
    (cts) => cts.coach_team_season_id
  );

  previous_coach_team_seasons = nest_children(
    previous_coach_team_seasons,
    previous_team_seasons_by_team_season_id,
    "team_season_id",
    "team_season"
  );

  const previous_coach_team_seasons_by_player_id = index_group_sync(
    previous_coach_team_seasons,
    "index",
    "coach_id"
  );
  coaches = nest_children(
    coaches,
    previous_coach_team_seasons_by_player_id,
    "coach_id",
    "previous_coach_team_season"
  );
  coaches = coaches.filter(
    (c) =>
      c.previous_coach_team_season != undefined && c.previous_coach_team_season.team_season_id > 0
  );

  await create_new_coach_team_seasons({
    common: common,
    coaches: coaches,
    previous_team_seasons: previous_team_seasons,
    team_seasons: team_seasons,
    world_id: world_id,
    season: new_season,
  });

  stopwatch(common, "Init New Season - Created coaches");

  await populate_all_depth_charts(common);

  stopwatch(common, "Init New Season - Created Depth Charts");

  await calculate_team_overalls(common);
  await calculate_national_rankings(next_week, all_weeks, common);
  await calculate_conference_rankings(next_week, all_weeks, common);
  await calculate_primetime_games(next_week, all_weeks, common);
  await calculate_team_needs(common);
  await choose_preseason_all_americans(common);

  stopwatch(common, "Init New Season - Created other info");

  await create_schedule({
    common: common,
    season: new_season,
    world_id: world_id,
  });

  stopwatch(common, "Init New Season - Created Schedule - DONE");
};

const create_team_season = async (data) => {
  const common = data.common;
  const db = common.db;
  const season = common.season;

  db.league_season.findOne({ season: season });

  let teams = db.team.find();
  let previous_team_seasons = db.team_season.find({ season: season - 1 });

  var team_seasons_tocreate = [];
  var team_season_stats_tocreate = [];

  let previous_team_seasons_by_team_id = index_group_sync(
    previous_team_seasons,
    "index",
    "team_id"
  );

  var last_team_season_id = db.team_season.nextId("team_season_id");
  $.each(teams, function (ind, team) {
    var team_season_id = last_team_season_id;
    if (team.team_id < 0) {
      if (team.team_id == -1) {
        team_season_id = -1;
      } else {
        team_season_id = -1 * season;
      }
      var new_team_season = new team_season({
        team_season_id: team_season_id,
        team_id: team.team_id,
        world_id: data.world_id,
        season: data.season,
        conference_name: null,
        conference_season_id: null,
        is_user_team: false,
      });

      team_seasons_tocreate.push(new_team_season);
    } else {
      let division_name = data.conferences_by_conference_name[
        team.conference.conference_name
      ].conference_season.divisions.find((d) => d.teams.includes(team.school_name)).division_name;

      let previous_team_season = previous_team_seasons_by_team_id[team.team_id] || {};

      let gameplan = team.starting_tendencies ||
        previous_team_season.gameplan || {
          offense: {
            playbook: "Spread",
            pass_tendency: 51,
            playcall_aggressiveness: 4,
            playclock_urgency: 4,
          },
          defense: {
            playbook: "4-3",
            blitz_tendency: 5,
            man_coverage_tendency: 5,
          },
        };

      var new_team_season = new team_season({
        team_season_id: team_season_id,
        team_id: team.team_id,
        world_id: data.world_id,
        season: data.season,
        conference_name: team.conference_name,
        conference_season_id:
          data.conferences_by_conference_name[team.conference.conference_name].conference_season
            .conference_season_id,
        division_name: division_name,
        is_user_team: team.is_user_team || false,
        gameplan: gameplan,
      });

      var new_team_season_stats = new team_season_stats(team_season_id);
      last_team_season_id += 1;

      team_seasons_tocreate.push(new_team_season);
      team_season_stats_tocreate.push(new_team_season_stats);
    }
  });

  console.log({
    team_seasons_tocreate: team_seasons_tocreate,
    team_season_stats_tocreate: team_season_stats_tocreate,
  });

  await Promise.all([
    db.team_season.insert(team_seasons_tocreate),
    db.team_season_stats.insert(team_season_stats_tocreate),
  ]);

  await db.saveDatabaseAsync();

};

const populate_all_depth_charts = async (common, team_season_ids) => {
  const db = common.db;
  const season = common.season;

  let adjacent_positions = {
    QB: ["RB", "S", "WR", "LB"],
    RB: ["FB", "WR", "LB"],
    FB: ["TE", "RB"],
    WR: ["TE", "RB", "CB"],
    TE: ["WR", "FB", "OT"],
    OT: ["IOL", "TE", "DL", "EDGE"],
    IOL: ["OT", "DL", "EDGE"],
    DL: ["EDGE", "LB", "IOL"],
    EDGE: ["DL", "LB"],
    LB: ["EDGE", "S"],
    CB: ["S", "LB", "WR"],
    S: ["CB", "LB", "RB", "TE"],
    K: ["P", "IOL", "CB", "S", "DL", "EDGE", "QB", "RB", "WR", "TE", "OT", "LB"],
    P: ["K", "IOL", "CB", "S", "DL", "EDGE", "QB", "RB", "WR", "TE", "OT", "LB"],
  };

  let position_minimum_count = {
    QB: 4,
    RB: 5,
    FB: 2,
    WR: 8,
    TE: 5,
    OT: 6,
    IOL: 6,
    DL: 6,
    EDGE: 6,
    LB: 6,
    CB: 6,
    S: 6,
    K: 2,
    P: 2,
  };

  let position_starter_count = {
    QB: 1,
    RB: 1,
    FB: 1,
    WR: 3,
    TE: 1,
    OT: 2,
    IOL: 2,
    DL: 2,
    EDGE: 2,
    LB: 3,
    CB: 2,
    S: 2,
    K: 1,
    P: 1,
  };

  console.log({ team_season_ids });
  if (team_season_ids) {
    team_season_ids = new Set(team_season_ids);

    var team_seasons = db.team_season.find({
      season: season,
      team_season_id: { $in: team_season_ids },
    });
    console.log({ season: season, db: db, team_seasons: team_seasons });

    var team_seasons_to_update = [];
    var team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");
    var player_team_seasons = db.player_team_season.find({
      season: season,
      team_season_id: { $in: team_season_ids },
    });
    var player_team_seasons_by_team_season_id = index_group_sync(
      player_team_seasons,
      "group",
      "team_season_id"
    );
  } else {
    var team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });
    console.log({ season: season, db: db, team_seasons: team_seasons });

    var team_seasons_to_update = [];
    var team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");
    var player_team_seasons = db.player_team_season.find({
      season: season,
      team_season_id: { $gt: 0 },
    });
    var player_team_seasons_by_team_season_id = index_group_sync(
      player_team_seasons,
      "group",
      "team_season_id"
    );
  }

  console.log({
    season: season,
    db: db,
    player_team_seasons: player_team_seasons,
    team_seasons: team_seasons,
  });

  //TODO fix this shit
  var signed_recruit_team_seasons = []; //await db.recruit_team_season.filter(rts => rts.signed).toArray();
  var signed_recruits_player_team_season_ids = signed_recruit_team_seasons.map(
    (rts) => rts.player_team_season_id
  );
  var signed_recruits_player_team_seasons = db.player_team_season.find({
    player_team_season_id: { $in: signed_recruits_player_team_season_ids },
  });

  var signed_recruit_team_seasons_by_player_team_season_id = index_group_sync(
    signed_recruit_team_seasons,
    "index",
    "player_team_season_id"
  );

  signed_recruits_player_team_seasons = nest_children(
    signed_recruits_player_team_seasons,
    signed_recruit_team_seasons_by_player_team_season_id,
    "player_team_season_id",
    "recruit_team_season"
  );

  signed_recruits_player_team_seasons = signed_recruits_player_team_seasons.map((pts) =>
    Object.assign(pts, {
      team_season_id: pts.recruit_team_season.team_season_id,
    })
  );

  var player_team_seasons_with_recruits = player_team_seasons.concat(
    signed_recruits_player_team_seasons
  );
  var player_team_seasons_with_recruits_by_team_season_id = index_group_sync(
    player_team_seasons_with_recruits,
    "group",
    "team_season_id"
  );

  var team_season = null;
  let player_team_seasons_to_update = [];

  for (var team_season_id in player_team_seasons_by_team_season_id) {
    let starter_player_team_season_ids = new Set();

    var player_team_season_list = player_team_seasons_by_team_season_id[team_season_id];
    team_season = team_seasons_by_team_season_id[team_season_id];

    var player_team_season_list_with_recruits =
      player_team_seasons_with_recruits_by_team_season_id[team_season_id];

    player_team_season_list = player_team_season_list.sort(
      (pts_a, pts_b) => pts_b.ratings.overall.overall - pts_a.ratings.overall.overall
    );

    player_team_season_list.forEach(
      (pts, ind) => (pts.player_team_overall_rank = ind + 1)
    );

    player_team_season_list_with_recruits = player_team_season_list_with_recruits.sort(
      (pts_a, pts_b) => pts_b.ratings.overall.overall - pts_a.ratings.overall.overall
    );

    team_season.depth_chart = {};
    team_season.depth_chart_with_recruits = {};

    var position_player_team_season_obj = index_group_sync(
      player_team_season_list,
      "group",
      "position"
    );
    var position_player_team_season_with_recruits_obj = index_group_sync(
      player_team_season_list_with_recruits,
      "group",
      "position"
    );

    Object.keys(position_minimum_count).forEach(function (pos) {
      if (!(pos in position_player_team_season_obj)) {
        position_player_team_season_obj[pos] = [];
      }
      if (!(pos in position_player_team_season_with_recruits_obj)) {
        position_player_team_season_with_recruits_obj[pos] = [];
      }
    });

    //TODO what if this is empty
    for (var position in position_player_team_season_obj) {
      var position_player_team_season_list = position_player_team_season_obj[position];

      if (position_player_team_season_list.length < position_minimum_count[position]) {
        let potential_players_to_add = [];
        adjacent_positions[position].forEach(function (pos) {
          potential_players_to_add = potential_players_to_add.concat(
            position_player_team_season_obj[pos].slice(
              0,
              position_starter_count[pos] +
                position_minimum_count[position] -
                position_player_team_season_list.length +
                1
            )
          );
        });
        potential_players_to_add = potential_players_to_add.filter(
          (pts) => !starter_player_team_season_ids.has(pts.player_team_season_id)
        );

        position_player_team_season_list =
          position_player_team_season_list.concat(potential_players_to_add);
        position_player_team_season_list = position_player_team_season_list.slice(
          0,
          position_minimum_count[position]
        );
      }

      for (
        let ind = 0;
        ind < position_starter_count[position] && ind < position_player_team_season_list.length;
        ind++
      ) {
        starter_player_team_season_ids.add(
          position_player_team_season_list[ind].player_team_season_id
        );
      }

      position_player_team_season_list.forEach(
        (pts, ind) => (pts.depth_chart_rank = Math.min(pts.depth_chart_rank || 10000, ind + 1))
      );
      player_team_seasons_to_update = player_team_seasons_to_update.concat(
        position_player_team_season_list
      );
      team_season.depth_chart[position] = position_player_team_season_list.map(
        (pts) => pts.player_team_season_id
      );
    }

    for (var position in position_player_team_season_with_recruits_obj) {
      var position_player_team_season_list =
        position_player_team_season_with_recruits_obj[position];
      team_season.depth_chart_with_recruits[position] = position_player_team_season_list.map(
        (pts) => pts.player_team_season_id
      );
    }

    team_seasons_to_update.push(team_season);
  }

  db.team_season.update(team_seasons_to_update);
  db.player_team_season.update(player_team_seasons_to_update);

  await db.saveDatabaseAsync();

  console.log({
    player_team_seasons_to_update: player_team_seasons_to_update,
    team_seasons_to_update: team_seasons_to_update,
    db: db,
  });
  // debugger;
};

const create_conference_seasons = async (data) => {
  const common = data.common;
  const db = common.db;
  const season = data.season;
  const world_id = data.world_id;

  let conference_season_id = db.conference_season.nextId("conference_season_id");

  var conference_seasons_to_create = [];

  for (const conference of data.conferences) {
    conference_season_id = conference_season_id + 1;
    var new_conference_season = {
      world_id: world_id,
      conference_id: conference.conference_id,
      conference_season_id: conference_season_id,
      season: season,
      divisions: conference.divisions,
      conference_champion_team_season_id: null,
    };

    conference_seasons_to_create.push(new_conference_season);
  }

  console.log("conference_seasons_to_create", {
    conference_seasons_to_create: conference_seasons_to_create,
  });

  db.conference_season.insert(conference_seasons_to_create);
  await db.saveDatabaseAsync();

};

const zip = (a, b) => {
  var zipped = a.map((elem, ind) => [elem, b[ind]]);
  return zipped.filter((zip_set) => zip_set[0] && zip_set[1]);
};

const create_schedule = async (data) => {
  const common = data.common;
  const db = common.db;
  const season = data.season;
  const world_id = data.world_id;

  const teams = db.team.find({ team_id: { $gt: 0 } });
  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  var games_to_create = [],
    team_games_to_create = [],
    team_games_to_create_ids = [];
  var team_season_schedule_tracker = {};
  const games_per_team = 12;

  let cities = ddb.cities.find();
  console.log({ cities: cities });
  cities.forEach((c) => (c.city_state = c.city + ", " + c.state));
  let cities_by_city_state = index_group_sync(cities, "index", "city_state");
  console.log({ cities_by_city_state: cities_by_city_state });

  let team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });
  const team_seasons_by_team_id = index_group_sync(team_seasons, "index", "team_id");
  const team_rivalries_by_team_season_id = index_group_sync(
    team_seasons.map(function (ts) {
      return {
        team_season_id: ts.team_season_id,
        rivals: teams_by_team_id[ts.team_id].rivals,
      };
    }),
    "index",
    "team_season_id"
  );
  const conferences_by_conference_id = index_group_sync(
    db.conference.find(),
    "index",
    "conference_id"
  );
  const conference_seasons_by_conference_season_id = index_group_sync(
    db.conference_season.find({ season: season }),
    "index",
    "conference_season_id"
  );

  const phases = index_group_sync(db.phase.find({ season: season }), "index", "phase_id");
  var weeks = db.week.find({ season: season });
  $.each(weeks, function (ind, week) {
    week.phase = phases[week.phase_id];
  });
  weeks = weeks.filter((week) => week.phase.phase_name == "Regular Season");
  let all_week_ids = new Set(weeks.map((w) => w.week_id));
  let all_weeks_by_week_id = index_group_sync(weeks, "index", "week_id");

  const weeks_by_week_name = index_group_sync(weeks, "index", "week_name");

  let num_teams = team_seasons.length;
  let team_quadrant_cutoffs = [1, 2, 3, 4].map((num) => ({
    quadrant: num,
    max_national_rank: Math.floor((num * num_teams) / 4.0),
  }));
  if (num_teams >= 100) {
    team_quadrant_cutoffs = [
      { quadrant: 1, max_national_rank: 25 },
      { quadrant: 2, max_national_rank: 50 },
      { quadrant: 3, max_national_rank: 75 },
      { quadrant: 4, max_national_rank: num_teams },
    ];
  }

  team_seasons = team_seasons.sort(
    (ts_a, ts_b) =>
      team_rivalries_by_team_season_id[ts_b.team_season_id].rivals.length -
      team_rivalries_by_team_season_id[ts_a.team_season_id].rivals.length
  );
  for (let team_season of team_seasons) {
    let team_season_rivals = team_rivalries_by_team_season_id[team_season.team_season_id].rivals;
    for (let rival_obj of team_season_rivals) {
      rival_obj.preferred_week_id = undefined;
      if (rival_obj.preferred_week_number != null) {
        rival_obj.preferred_week_id =
          weeks_by_week_name["Week " + rival_obj.preferred_week_number].week_id;
      }

      console.log("rivals", {
        rival_obj: rival_obj,
        "rival_obj.preferred_week_id": rival_obj.preferred_week_id,
        "rival_obj.preferred_week_number": rival_obj.preferred_week_number,
        weeks_by_week_name: weeks_by_week_name,
      });

      rival_obj.opponent_team_season_id =
        team_seasons_by_team_id[rival_obj.opponent_team_id.toString()].team_season_id;
    }
    let team_conference =
      conferences_by_conference_id[
        conference_seasons_by_conference_season_id[team_season.conference_season_id].conference_id
      ];

    console.log({
      team_quadrant_cutoffs: team_quadrant_cutoffs,
      "team_season.national_rank": team_season.national_rank,
      team_season:team_season
    });

    team_season_schedule_tracker[team_season.team_season_id] = {
      conference: {
        games_to_schedule: team_conference.schedule_format.number_conference_games,
        games_scheduled: 0,
        home_games: 0,
        away_games: 0,
        net_home_games: 0,
      },
      non_conference: {
        games_to_schedule:
          (team_conference.schedule_format.number_games || games_per_team) -
          team_conference.schedule_format.number_conference_games,
        games_scheduled: 0,
        home_games: 0,
        away_games: 0,
        net_home_games: 0,
        max_ooc_travel_distance: team_conference.schedule_format.max_ooc_travel_distance || 1000000,
      },
      weeks_scheduled: new Set(),
      available_week_ids: new Set(all_week_ids),
      opponents_scheduled: new Set(),
      conference_season_id: team_season.conference_season_id,
      division_name: team_season.division_name,
      rivals: team_season_rivals,
      team: teams_by_team_id[team_season.team_id],
      city: cities_by_city_state[
        teams_by_team_id[team_season.team_id].location.city +
          ", " +
          teams_by_team_id[team_season.team_id].location.state
      ],
      team_quadrant: team_quadrant_cutoffs.find(
        (quadrant) => team_season.national_rank <= quadrant.max_national_rank
      ).quadrant,
    };

    if (
      !team_season_schedule_tracker[team_season.team_season_id].city ||
      !team_season_schedule_tracker[team_season.team_season_id].city.lat ||
      !team_season_schedule_tracker[team_season.team_season_id].city.long
    ) {
      console.log("BLANK CITY", {
        "team_season_schedule_tracker[team_season.team_season_id]":
          team_season_schedule_tracker[team_season.team_season_id],
      });
    }

    let games_per_quadrant = Math.ceil(
      team_season_schedule_tracker[team_season.team_season_id].non_conference.games_to_schedule /
        4.0
    );

    team_season_schedule_tracker[
      team_season.team_season_id
    ].non_conference.schedule_team_quadrants = {
      1: games_per_quadrant,
      2: games_per_quadrant,
      3: games_per_quadrant,
      4: games_per_quadrant,
    };

    console.log({
      team_season: team_season,
      team_season_schedule_tracker: team_season_schedule_tracker,
      team_quadrant_cutoffs: team_quadrant_cutoffs,
    });
  }

  var scheduling_teams = true;
  var team_season_id_list = [];
  var team_set_a = [],
    team_set_b = [],
    zipped_set = [],
    games_to_create_ids = [];

  var game_type = "";

  var next_game_id = db.game.nextId("game_id");
  var next_team_game_id = db.team_game.nextId("team_game_id");

  team_seasons = index_group_sync(
    db.team_season.find({ season: season, team_id: { $gt: 0 } }),
    "index",
    "team_id"
  );
  let team_seasons_by_conference_season_id = index_group_sync(
    db.team_season.find({ season: season, team_id: { $gt: 0 } }),
    "group",
    "conference_season_id"
  );

  var scheduling_dict = {
    team_season_schedule_tracker: team_season_schedule_tracker,
    all_week_ids: all_week_ids,
    all_weeks_by_week_id: all_weeks_by_week_id,
    world_id: world_id,
    season: season,
    next_team_game_id: next_team_game_id,
    next_game_id: next_game_id,
    team_games_to_create_ids: team_games_to_create_ids,
    team_games_to_create: team_games_to_create,
    games_to_create_ids: games_to_create_ids,
    games_to_create: games_to_create,
  };

  var attempt_counter = 0;
  //Schedule rival games
  while (scheduling_teams) {
    team_season_id_list = Object.keys(team_season_schedule_tracker);

    zipped_set = [];
    $.each(team_season_id_list, function (ind, team_season_id) {
      let rival_list = team_season_schedule_tracker[team_season_id].rivals;
      $.each(rival_list, function (ind, rival_obj) {
        zipped_set.push([
          team_season_id,
          team_seasons_by_team_id[rival_obj.opponent_team_id.toString()].team_season_id.toString(),
          rival_obj,
        ]);
      });
    });

    console.log("zipped_set", zipped_set);
    zipped_set = zipped_set.sort(function (set_a, set_b) {
      if (set_a[2].preferred_week_id != undefined) {
        return -1;
      } else if (set_b[2].preferred_week_id != undefined) {
        return 1;
      }
      return 1;
    });

    $.each(zipped_set, function (ind, team_set) {
      //check if confernece, pass to next
      let [team_a, team_b, rival_obj] = team_set;
      game_type = "non_conference";
      if (
        team_season_schedule_tracker[team_a].conference_season_id ==
        team_season_schedule_tracker[team_b].conference_season_id
      ) {
        game_type = "conference";
      }
      schedule_game(common, scheduling_dict, team_set, game_type, rival_obj);
    });

    scheduling_teams = false;
  }

  attempt_counter = 0;
  scheduling_teams = true;
  //Schedule conference games
  while (scheduling_teams) {
    team_season_id_list = Object.keys(team_season_schedule_tracker);
    team_season_id_list = new Set(
      team_season_id_list.filter(
        (team_id) => team_season_schedule_tracker[team_id].conference.games_to_schedule > 0
      )
    );

    $.each(team_seasons_by_conference_season_id, function (conference_season_id, team_seasons) {
      let conference_team_season_id_list = team_seasons.map((ts) => ts.team_season_id.toString());
      conference_team_season_id_list = conference_team_season_id_list.filter((ts) =>
        team_season_id_list.has(ts)
      );
      conference_team_season_id_list = shuffle(conference_team_season_id_list);

      for (var team_id of conference_team_season_id_list) {
        team_season_schedule_tracker[team_id].first_available_week_id = Math.min(
          ...team_season_schedule_tracker[team_id].available_week_ids
        );
      }

      if (attempt_counter % 5 == 4) {
        //Just random shuffle
        conference_team_season_id_list = shuffle(conference_team_season_id_list);
      } else if (attempt_counter % 5 < 4) {
        //Sort by number of conference games needed
        conference_team_season_id_list = conference_team_season_id_list.sort(
          (team_a, team_b) =>
            team_season_schedule_tracker[team_a].conference.games_to_schedule -
              team_season_schedule_tracker[team_b].conference.games_to_schedule ||
            team_season_schedule_tracker[team_a].first_available_week_id -
              team_season_schedule_tracker[team_b].first_available_week_id ||
            Math.random() > 0.5
        );
      }

      const half = Math.floor(conference_team_season_id_list.length / 2);
      team_set_a = conference_team_season_id_list.splice(0, half);
      team_set_b = conference_team_season_id_list.splice(-half);
      team_set_b = team_set_b.reverse();
      // if (attempt_counter % 2 == 0){
      // 	team_set_b = team_set_b.reverse();
      // }

      zipped_set = zip(team_set_a, team_set_b);
      //console.log('zipped_set', zipped_set)
      $.each(zipped_set, function (ind, team_set) {
        schedule_game(common, scheduling_dict, team_set, "conference", null, attempt_counter);
      });
    });

    team_season_id_list = [...team_season_id_list].filter(
      (team_id) => team_season_schedule_tracker[team_id].conference.games_to_schedule > 0
    );

    scheduling_teams = team_season_id_list.length > 1 && attempt_counter < 800;

    attempt_counter += 1;
    team_set_a = [];
    team_set_b = [];
  }

  $.each(team_season_schedule_tracker, function (team_id, team_obj) {
    if (team_obj.conference.games_to_schedule > 0) {
      console.log("Left over games", {
        "team_obj.conference.games_to_schedule": team_obj.conference.games_to_schedule,
        team_obj: team_obj,
      });
    }
    team_obj.non_conference.games_to_schedule += team_obj.conference.games_to_schedule;
  });

  let quadrant_pairings = [
    [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ],
    [
      [1, 3],
      [2, 4],
    ],
    [
      [1, 4],
      [2, 3],
    ],
    [
      [1, 2],
      [3, 4],
    ],
  ];
  let team_season_ids_by_quadrant = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  Object.entries(team_season_schedule_tracker).forEach(function ([team_season_id, tracker_obj]) {
    team_season_ids_by_quadrant[tracker_obj.team_quadrant].push(team_season_id);
    console.log({
      tracker_obj: tracker_obj,
      team_season_id: team_season_id,
      team_season_ids_by_quadrant: team_season_ids_by_quadrant,
    });
  });

  console.log({
    team_season_ids_by_quadrant: team_season_ids_by_quadrant,
    team_season_ids_by_quadrant: team_season_ids_by_quadrant,
    team_season_schedule_tracker: team_season_schedule_tracker,
  });

  //scheduling quadrants
  for (let quadrant_pairing of quadrant_pairings) {
    // team_season_id_list = Object.keys(team_season_schedule_tracker);
    // team_season_id_list = team_season_id_list.filter(
    //   (team_id) =>
    //     team_season_schedule_tracker[team_id].non_conference.games_to_schedule >
    //     0
    // );
    // var max_games_to_schedule =
    //   Math.max(
    //     ...team_season_id_list.map(
    //       (team_id) =>
    //         team_season_schedule_tracker[team_id].non_conference
    //           .games_to_schedule
    //     )
    //   ) - Math.floor(attempt_counter / 5);

    // max_games_to_schedule = Math.max(0, max_games_to_schedule);

    console.log({
      quadrant_pairing: quadrant_pairing,
      max_games_to_schedule: max_games_to_schedule,
      team_season_id_list: team_season_id_list,
    });

    for (let pair of quadrant_pairing) {
      for (let iter_ind = 0; iter_ind <= 100; iter_ind++) {
        let quadrant_a = pair[0];
        let quadrant_b = pair[1];
        console.log({
          pair: pair,
          quadrant_a: quadrant_a,
          quadrant_b: quadrant_b,
        });

        if (quadrant_a != quadrant_b) {
          var quadrant_a_teams = team_season_ids_by_quadrant[quadrant_a];
          var quadrant_b_teams = team_season_ids_by_quadrant[quadrant_b];

          quadrant_a_teams = quadrant_a_teams.filter(
            (ts_id) =>
              team_season_schedule_tracker[ts_id].non_conference.schedule_team_quadrants[
                quadrant_b
              ] > 0 &&
              (team_season_schedule_tracker[ts_id].available_week_ids.has(all_week_ids[iter_ind]) ||
                iter_ind > 3)
          );
          quadrant_b_teams = quadrant_b_teams.filter(
            (ts_id) =>
              team_season_schedule_tracker[ts_id].non_conference.schedule_team_quadrants[
                quadrant_a
              ] > 0 &&
              (team_season_schedule_tracker[ts_id].available_week_ids.has(all_week_ids[iter_ind]) ||
                iter_ind > 3)
          );

          quadrant_a_teams = shuffle(quadrant_a_teams);
          quadrant_b_teams = shuffle(quadrant_b_teams);
          console.log({
            quadrant_a_teams: quadrant_a_teams,
            quadrant_b_teams: quadrant_b_teams,
          });
        } else {
          let quadrant_all_teams = team_season_ids_by_quadrant[quadrant_a];
          quadrant_all_teams = shuffle(quadrant_all_teams);
          quadrant_all_teams = quadrant_all_teams.filter(
            (ts_id) =>
              team_season_schedule_tracker[ts_id].non_conference.schedule_team_quadrants[
                quadrant_a
              ] > 0 //&& (team_season_schedule_tracker[ts_id].available_week_ids.has(all_week_ids[iter_ind]) || iter_ind > 3)
          );

          console.log({ quadrant_all_teams: quadrant_all_teams });
          var middle_index = Math.floor(quadrant_all_teams.length / 2);
          var quadrant_a_teams = quadrant_all_teams.slice(0, middle_index);
          var quadrant_b_teams = quadrant_all_teams.slice(middle_index);
        }

        console.log({
          quadrant_a_teams: quadrant_a_teams,
          quadrant_b_teams: quadrant_b_teams,
        });

        zipped_set = zip(quadrant_a_teams, quadrant_b_teams);
        console.log("zipped_set", zipped_set);

        $.each(zipped_set, function (ind, team_set) {
          schedule_game(common, scheduling_dict, team_set, "non_conference", null, iter_ind);
        });
      }
    }
  }

  scheduling_teams = true;
  attempt_counter = 1;
  //Scheduling non_conference
  while (scheduling_teams) {
    team_season_id_list = Object.keys(team_season_schedule_tracker);
    team_season_id_list = team_season_id_list.filter(
      (team_id) => team_season_schedule_tracker[team_id].non_conference.games_to_schedule > 0
    );
    var max_games_to_schedule =
      Math.max(
        ...team_season_id_list.map(
          (team_id) => team_season_schedule_tracker[team_id].non_conference.games_to_schedule
        )
      ) - Math.floor(attempt_counter / 5);

    max_games_to_schedule = Math.max(0, max_games_to_schedule);

    for (var team_id of team_season_id_list) {
      team_season_schedule_tracker[team_id].first_available_week_id = Math.min(
        ...team_season_schedule_tracker[team_id].available_week_ids
      );
    }

    //One out of ten times, or any attempt past #50, just go wild & full random
    if (attempt_counter % 10 == 9 || attempt_counter > 50) {
      team_season_id_list = shuffle(team_season_id_list);
      $.each(team_season_id_list, function (ind, obj) {
        if (ind % 2 == 0) {
          team_set_a.push(obj);
        } else {
          team_set_b.push(obj);
        }
      });
    } else if (attempt_counter % 10 >= 7) {
      // 3 out of 10 times, sort by # of opps needed, but flip second half. Sort of a non-perfect match scenario
      team_season_id_list = team_season_id_list.sort(function (team_id_a, team_id_b) {
        return (
          team_season_schedule_tracker[team_id_a].opponents_scheduled.size -
            team_season_schedule_tracker[team_id_b].opponents_scheduled.size || Math.random() - 0.5
        );
      });

      var middle_index = Math.floor(team_season_id_list.length / 2);
      team_set_a = team_season_id_list.slice(0, middle_index);
      team_set_b = team_season_id_list.slice(middle_index);
      team_set_b = team_set_b.reverse();
    } else if (attempt_counter % 10 >= 5) {
      // 2 out of 10 times, sort by max week scheduled?
      team_season_id_list = team_season_id_list.sort(function (team_id_a, team_id_b) {
        return (
          Math.max(...team_season_schedule_tracker[team_id_a].weeks_scheduled) -
            Math.max(...team_season_schedule_tracker[team_id_b].weeks_scheduled) ||
          Math.random() - 0.5
        );
      });

      var middle_index = Math.floor(team_season_id_list.length / 2);
      team_set_a = team_season_id_list.slice(0, middle_index);
      team_set_b = team_season_id_list.slice(middle_index);
      team_set_b = team_set_b.reverse();
    } else {
      for (var team_id of team_season_id_list) {
        team_season_schedule_tracker[team_id].opponent_avg_team_competitiveness =
          sum(
            [...team_season_schedule_tracker[team_id].opponents_scheduled].map(
              (team_id) =>
                team_season_schedule_tracker[team_id].team.team_ratings.team_competitiveness
            )
          ) / team_season_schedule_tracker[team_id].opponents_scheduled.size;
      }

      team_season_id_list = team_season_id_list.sort(function (team_id_a, team_id_b) {
        return (
          team_season_schedule_tracker[team_id_a].opponent_avg_team_competitiveness -
            team_season_schedule_tracker[team_id_b].opponent_avg_team_competitiveness ||
          Math.random() - 0.5
        );
      });

      var middle_index = Math.ceil(team_season_id_list.length / 2);
      team_set_a = team_season_id_list.slice(0, middle_index);
      team_set_b = team_season_id_list.slice(middle_index);

      if (attempt_counter % 2 == 0) {
        team_set_b = team_set_b.reverse();
      }
    }

    console.log({ team_set_a: team_set_a, team_set_b: team_set_b });

    zipped_set = zip(team_set_a, team_set_b);
    console.log("zipped_set", zipped_set);
    $.each(zipped_set, function (ind, team_set) {
      if (
        team_season_schedule_tracker[team_set[0]].non_conference.games_to_schedule <
          max_games_to_schedule &&
        team_season_schedule_tracker[team_set[1]].non_conference.games_to_schedule <
          max_games_to_schedule
      ) {
        console.log("throwing out game", {
          team_set: team_set,
          "team_season_schedule_tracker[team_set[0]].non_conference.games_to_schedule":
            team_season_schedule_tracker[team_set[0]].non_conference.games_to_schedule,
          "team_season_schedule_tracker[team_set[1]].non_conference.games_to_schedule":
            team_season_schedule_tracker[team_set[1]].non_conference.games_to_schedule,
          max_games_to_schedule: max_games_to_schedule,
        });
        return true;
      }
      schedule_game(common, scheduling_dict, team_set, "non_conference", null);
    });

    team_season_id_list = Object.keys(team_season_schedule_tracker).filter(
      (team_id) => team_season_schedule_tracker[team_id].non_conference.games_to_schedule > 0
    );

    scheduling_teams = team_season_id_list.length > 1 && attempt_counter < 500;

    attempt_counter += 1;
    team_set_a = [];
    team_set_b = [];
  }

  console.log({
    scheduling_dict: scheduling_dict,
    team_season_schedule_tracker: team_season_schedule_tracker,
    games_to_create: games_to_create,
    team_games_to_create: team_games_to_create,
  });

  for (var team_season_obj of Object.values(team_season_schedule_tracker)) {
    if (team_season_obj.non_conference.games_to_schedule > 0) {
      console.log("couldnt schedule", { team_season_obj: team_season_obj });
    }
  }

  Object.values(team_seasons);

  db.game.insert(games_to_create);
  db.team_game.insert(team_games_to_create);
  await db.saveDatabaseAsync();

};

const advance_player_team_seasons = async (data) => {
  console.log({ data: data });

  const common = data.common;
  const db = common.db;

  const team_seasons = data.team_seasons;
  data.players;

  const team_seasons_by_team_id = index_group_sync(team_seasons, "index", "team_id");
  index_group_sync(team_seasons, "index", "team_season_id");

  const previous_team_seasons_by_team_season_id = index_group_sync(
    data.previous_team_seasons,
    "index",
    "team_season_id"
  );

  var player_team_season_id_counter = db.player_team_season.nextId("player_team_season_id");
  var player_team_seasons_tocreate = [];
  var player_team_season_stats_tocreate = [];

  const next_class_map = {
    "HS JR": "HS SR",
    "HS SR": "FR",
    FR: "SO",
    SO: "JR",
    JR: "SR",
  };

  let position_minimum_count = {
    QB: 4,
    RB: 5,
    FB: 2,
    WR: 8,
    TE: 5,
    OT: 6,
    IOL: 6,
    DL: 6,
    EDGE: 6,
    LB: 6,
    CB: 6,
    S: 6,
    K: 2,
    P: 2,
    All: 100,
  };

  let team_season_position_count_map = {};
  team_seasons.forEach(function (ts) {
    team_season_position_count_map[ts.team_season_id] = deep_copy(position_minimum_count);
  });

  for (const player of data.players) {
    if (player.previous_player_team_season.class.class_name in next_class_map) {
      let previous_team_season_id = player.previous_player_team_season.team_season_id;

      let team_season_id = 0;
      if (previous_team_season_id > 0) {
        team_season_id =
          team_seasons_by_team_id[
            previous_team_seasons_by_team_season_id[previous_team_season_id].team_id
          ].team_season_id;
      }

      let next_class_name = next_class_map[player.previous_player_team_season.class.class_name];
      let redshirted = false;
      if (
        player.previous_player_team_season.season_stats &&
        (player.previous_player_team_season.season_stats.games.games_played || 0) <= 4 &&
        !player.previous_player_team_season.class.redshirted
      ) {
        redshirted = true;
        next_class_name = player.previous_player_team_season.class.class_name;
      }

      let new_pts = new player_team_season({
        player_id: player.player_id,
        player_team_season_id: player_team_season_id_counter,
        team_season_id: team_season_id,
        season: data.season,
        world_id: data.world_id,
        position: player.position,
        class: {
          class_name: next_class_name,
          redshirted: redshirted,
        },
        ratings: deep_copy(player.previous_player_team_season.ratings),
      });

      for (const rating_group_key in new_pts.ratings) {
        var rating_group = new_pts.ratings[rating_group_key];

        for (const rating_key in rating_group) {
          var rating_value = new_pts.ratings[rating_group_key][rating_key];

          let aged_in_rating_value = age_in_rating(rating_group_key, rating_key, rating_value);

          new_pts.ratings[rating_group_key][rating_key] = aged_in_rating_value;
        }
      }

      var new_player_team_season_stats = new player_team_season_stats(
        new_pts.player_team_season_id
      );

      if (team_season_id > 0) {
        team_season_position_count_map[team_season_id][player.position] -= 1;
        team_season_position_count_map[team_season_id]["All"] -= 1;
      }

      player_team_seasons_tocreate.push(new_pts);
      player_team_season_stats_tocreate.push(new_player_team_season_stats);
      player_team_season_id_counter += 1;
    }
  }

  let position_team_season_count_map = {};
  Object.keys(position_minimum_count).forEach(function (pos) {
    position_team_season_count_map[pos] = {};
    Object.entries(team_season_position_count_map).forEach(function (ts_map) {
      let team_season_id = ts_map[0];
      let position_need = ts_map[1][pos];
      if (position_need > 0) {
        position_team_season_count_map[pos][team_season_id] = position_need;
      }
      console.log({
        team_season_id: team_season_id,
        position_need: position_need,
        "position_team_season_count_map[pos][team_season_id]":
          position_team_season_count_map[pos][team_season_id],
      });
    });
  });

  console.log({
    position_team_season_count_map: position_team_season_count_map,
    team_season_position_count_map: team_season_position_count_map,
  });

  player_team_seasons_tocreate
    .filter((pts) => !pts.team_season_id)
    .forEach(function (pts) {
      let position = pts.position;
      let position_team_season_needs = position_team_season_count_map[position];
      let team_season_id = parseInt(weighted_random_choice(position_team_season_needs, 0));
      pts.team_season_id = team_season_id;

      position_team_season_count_map[position][team_season_id] -= 1;
      position_team_season_count_map["All"][team_season_id] -= 1;
      if (position_team_season_count_map[position][team_season_id] <= 0) {
        delete position_team_season_count_map[position][team_season_id];
      }
      if (position_team_season_count_map["All"][team_season_id] <= 0) {
        delete position_team_season_count_map["All"][team_season_id];
      }
    });

  player_team_seasons_tocreate
    .filter((pts) => !pts.team_season_id)
    .forEach(function (pts) {
      let position_team_season_needs = position_team_season_count_map["All"];
      let team_season_id = parseInt(weighted_random_choice(position_team_season_needs) || 0);
      pts.team_season_id = team_season_id;

      position_team_season_count_map["All"][team_season_id] -= 1;
      if (position_team_season_count_map["All"][team_season_id] <= 0) {
        delete position_team_season_count_map["All"][team_season_id];
      }
    });

  console.log("checking player_team_seasons_tocreate 1", {
    player_team_seasons_tocreate: player_team_seasons_tocreate,
    player_team_seasons_tocreate_f: player_team_seasons_tocreate.filter(
      (pts) => !pts.team_season_id
    ),
  });

  player_team_seasons_tocreate
    .filter((pts) => !pts.team_season_id)
    .forEach(function (pts) {
      pts.team_season_id = -1;
    });

  console.log({
    last_player_team_season: last_player_team_season,
    player_team_seasons_tocreate: player_team_seasons_tocreate,
    player_team_season_stats_tocreate: player_team_season_stats_tocreate,
  });

  await Promise.all([
    db.player_team_season.update(player_team_seasons_tocreate),
    db.player_team_season_stats.update(player_team_season_stats_tocreate),
  ]);

  await db.saveDatabaseAsync();

};

const create_new_coach_team_seasons = async (data) => {
  console.log({ data: data });

  const common = data.common;
  const db = common.db;

  const team_seasons = data.team_seasons;
  data.coaches;

  const team_seasons_by_team_id = index_group_sync(team_seasons, "index", "team_id");
  index_group_sync(team_seasons, "index", "team_season_id");

  const previous_team_seasons_by_team_season_id = index_group_sync(
    data.previous_team_seasons,
    "index",
    "team_season_id"
  );

  var coach_team_season_id_counter = db.coach_team_season.nextId("coach_team_season_id");
  var coach_team_seasons_tocreate = [];

  for (const coach of data.coaches) {
    var previous_team_season_id = coach.previous_coach_team_season.team_season_id;
    var team_season_id =
      team_seasons_by_team_id[
        previous_team_seasons_by_team_season_id[previous_team_season_id].team_id
      ].team_season_id;

    var init_data = {
      coach_id: coach.coach_id,
      coach_team_season_id: coach_team_season_id_counter,
      team_season_id: team_season_id,
      season: data.season,
      world_id: data.world_id,
      coaching_position: coach.previous_coach_team_season.coaching_position,
      age: coach.previous_coach_team_season.age + 1,
    };

    var new_cts = new coach_team_season(init_data);

    coach_team_seasons_tocreate.push(new_cts);
    coach_team_season_id_counter += 1;
  }

  db.coach_team_season.update(
    coach_team_seasons_tocreate
  );

  await db.saveDatabaseAsync();

};

const age_in_rating = (rating_group, rating, value) => {
  let rating_change_probability = 0.1;

  if (rating_group == "athleticism") {
    rating_change_probability = 0.05;
  } else if (rating_group == "passing") {
    rating_change_probability = 0.7;
  } else if (rating_group == "rushing") {
    rating_change_probability = 0.2;
  } else if (rating_group == "receiving") {
    rating_change_probability = 0.3;
  } else if (rating_group == "defense") {
    rating_change_probability = 0.45;
  } else if (rating_group == "blocking") {
    rating_change_probability = 0.6;
  } else {
    rating_change_probability = 0.1;
  }

  var severe_rating_change_probability = rating_change_probability / 5;

  var rand = Math.random();
  if (rand < severe_rating_change_probability) {
    value += 8;
  } else if (rand < rating_change_probability) {
    value += 4;
  }

  if (value > 100) {
    return 100;
  }

  return round_decimal(value, 0);
};

const age_out_rating = (rating_group, rating, value, class_name) => {
  let class_age_out_map = {
    SR: 0,
    JR: 1,
    SO: 2,
    FR: 3,
    "HS SR": 4,
    "HS JR": 5,
  };
  var age_out_years = class_age_out_map[class_name];

  let rating_change_probability = 0.1;

  if (rating_group == "athleticism") {
    rating_change_probability = 0.05;
  } else if (rating_group == "passing") {
    rating_change_probability = 0.7;
  } else if (rating_group == "rushing") {
    rating_change_probability = 0.2;
  } else if (rating_group == "receiving") {
    rating_change_probability = 0.3;
  } else if (rating_group == "defense") {
    rating_change_probability = 0.45;
  } else if (rating_group == "blocking") {
    rating_change_probability = 0.6;
  } else {
    rating_change_probability = 0.1;
  }

  var severe_rating_change_probability = rating_change_probability / 5;

  for (var i = 0; i < age_out_years; i++) {
    var rand = Math.random();
    if (rand < severe_rating_change_probability) {
      value -= 8;
    } else if (rand < rating_change_probability) {
      value -= 4;
    }
  }

  if (value < 1) {
    return 1;
  }

  return round_decimal(value, 0);
};

const recruiting_pitch_value = (player_value, team_value) => {
  return Math.ceil((player_value ** 1.425 * (team_value - 4)) / 2.56);
};

const create_recruiting_class = async (common) => {
  console.log("In create recruiting_class", common);
  const db = common.db;
  common.season;
  const recruiting_team_season_id = -1 * common.season;

  stopwatch(common, "Stopwatch RTS - Starting creating recruiting class");

  var team_seasons = db.team_season.find({ season: common.season, team_id: { $gt: 0 } });

  team_seasons.map((ts) => ts.team_season_id);

  const teams = db.team.find({ team_id: { $gt: 0 } });
  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");

  //const team_seasons_by_team_id = index_group_sync(team_seasons, 'index', 'team_id')
  const team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  stopwatch(common, "Stopwatch RTS - Fetched all team info");

  var player_team_seasons = db.player_team_season.find({
    team_season_id: recruiting_team_season_id,
  });
  player_team_seasons.map((pts) => pts.player_team_season_id);
  const player_ids = player_team_seasons.map((pts) => pts.player_id);

  const players = db.player.find({ player_id: { $in: player_ids } });
  const players_by_player_id = index_group_sync(players, "index", "player_id");

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

  stopwatch(common, "Stopwatch RTS - Fetched all player info");

  var position_star_weight_map = {
    QB: 0,
    RB: -1,
    FB: -10,
    WR: -1,
    TE: -4,
    OT: -1,
    IOL: -4,
    DL: 0,
    EDGE: 0,
    LB: -2,
    CB: -1,
    S: -5,
    K: -10,
    P: -10,
  };

  // TODO make the rankings fuzzy
  player_team_seasons = player_team_seasons.sort(
    (pts_a, pts_b) =>
      pts_b.ratings.overall.overall +
      position_star_weight_map[pts_b.position] -
      (pts_a.ratings.overall.overall + position_star_weight_map[pts_a.position])
  );

  stopwatch(common, "Stopwatch RTS - Sorted players");

  let recruit_team_season_id = db.recruit_team_season.nextId("recruit_team_season_id");

  stopwatch(common, "Stopwatch RTS - First RTS");

  var players_to_update = [];

  console.log({ player_team_seasons: player_team_seasons });

  var player_count = 1;
  var total_players = player_team_seasons.length;
  var player_star_map = [
    { stars: 5, percent: 0.01 },
    { stars: 4, percent: 0.1 },
    { stars: 3, percent: 0.3 },
    { stars: 2, percent: 0.45 },
    { stars: 1, percent: 0.14 },
  ];
  var player_interest_cutoffs = [[6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1]];

  var player_star_tracker = 0;
  for (const star_obj of player_star_map) {
    star_obj.players_in_bucket = Math.ceil(total_players * star_obj.percent);
    player_star_tracker += star_obj.players_in_bucket;
    star_obj.players_in_bucket_cumulative = player_star_tracker;
  }

  var position_rank_map = {};
  var state_rank_map = {};

  var recruit_team_seasons_to_add_by_team_season_id = {};
  for (const team_season of team_seasons) {
    recruit_team_seasons_to_add_by_team_season_id[team_season.team_season_id] = [];
  }

  console.log({
    team_seasons: team_seasons,
    position_needs: team_seasons.map((ts) => ts.recruiting.position_needs),
    player_team_seasons: player_team_seasons,
  });

  var player_call_tracker = {};

  let recruit_team_seasons_by_team_season_id = {};
  team_seasons.forEach((ts) => (recruit_team_seasons_by_team_season_id[ts.team_season_id] = []));

  stopwatch(common, "Stopwatch RTS - Prepped all vars");

  for (const player_team_season of player_team_seasons) {
    var player = players_by_player_id[player_team_season.player_id];
    console.log({
      player_team_season: player_team_season,
      player: player,
    });

    player_team_season.recruiting.stars = null;
    player_team_season.recruiting.stage = "Early";

    player_team_season.recruiting.player_interest_cutoff = deep_copy(
      player_interest_cutoffs[Math.floor(Math.random() * player_interest_cutoffs.length)]
    );
    player_call_tracker[player_team_season.player_team_season_id] =
      player_team_season.recruiting.player_interest_cutoff;

    var player_state = player.hometown.state;
    var player_position = player.position;

    if (!(player_state in state_rank_map)) {
      state_rank_map[player_state] = 0;
    }
    state_rank_map[player_state] += 1;

    if (!(player_position in position_rank_map)) {
      position_rank_map[player_position] = 0;
    }
    position_rank_map[player_position] += 1;

    player_team_season.recruiting.rank.national = player_count;
    player_team_season.recruiting.rank.position_rank = position_rank_map[player_position];
    player_team_season.recruiting.rank.state = state_rank_map[player_state];

    player_team_season.recruiting.stars = player_star_map.find(
      (star_obj) => player_count <= star_obj.players_in_bucket_cumulative
    ).stars;
    // for (const star_obj of player_star_map) {
    //   if (
    //     player_team_season.recruiting.stars == null &&
    //     player_count <= star_obj.players_in_bucket_cumulative
    //   ) {
    //     player_team_season.recruiting.stars = star_obj.stars;
    //   }
    // }

    for (const team_season of team_seasons) {
      // let close_to_home_rating = distance_from_home(
      //                               player.hometown,
      //                               team_season.team.location,
      //                               location_tracker_map
      //                             )
      let close_to_home_rating = 100; // TODO change back!!!

      recruit_team_season_id += 1;
      let rts = new recruit_team_season({
        recruit_team_season_id: recruit_team_season_id,
        team_season_id: team_season.team_season_id,
        player_team_season_id: player_team_season.player_team_season_id,
        // scouted_ratings: deep_copy(player_team_season.ratings),
        scouted_ratings: player_team_season.ratings,
        //, distance: distance_between_cities(player.hometown, team_season.team.location)
        match_rating: 0,
        match_ratings: {
          location: {
            topic: "location",
            team: team_season.team.team_ratings.location,
            team_known: false,
          },
          fan_support: {
            topic: "fan_support",
            team: team_season.team.team_ratings.fan_support,
            team_known: false,
          },
          academic_quality: {
            topic: "academic_quality",
            team: team_season.team.team_ratings.academic_quality,
            team_known: false,
          },
          facilities: {
            topic: "facilities",
            team: team_season.team.team_ratings.facilities,
            team_known: false,
          },
          program_history: {
            topic: "program_history",
            team: team_season.team.team_ratings.program_history,
            team_known: false,
          },
          team_competitiveness: {
            topic: "team_competitiveness",
            team: team_season.team.team_ratings.team_competitiveness,
            team_known: false,
          },
          brand: {
            topic: "brand",
            team: team_season.team.team_ratings.brand,
            team_known: false,
          },
          pro_pipeline: {
            topic: "pro_pipeline",
            team: team_season.team.team_ratings.pro_pipeline,
            team_known: false,
          },

          program_stability: {
            topic: "program_stability",
            team: 10,
            team_known: false,
          },
          playing_time: { topic: "playing_time", team: 10, team_known: false },
          close_to_home: {
            topic: "close_to_home",
            team: close_to_home_rating,
            team_known: false,
          },
        },
      });

      // console.log({
      //   team_season:team_season,
      //   rts:rts,
      //   player_team_season:player_team_season,
      //   'player_team_season.position': player_team_season.position,
      //   'team_season.recruiting.position_needs[player_team_season.position]':team_season.recruiting.position_needs[player_team_season.position],
      //   'rts.scouted_ratings.overall.overall': rts.scouted_ratings.overall.overall
      // })

      rts.match_ratings.playing_time.team = team_season.recruiting.position_needs[
        player_team_season.position
      ].find((ovr_obj) => ovr_obj.overall <= rts.scouted_ratings.overall.overall).playing_time_val;

      rts.team_top_level_interest =
        Math.ceil((rts.scouted_ratings.overall.overall - 60) / 5) +
        rts.match_ratings.playing_time.team +
        (rts.match_ratings.close_to_home.team * 4) / rts.match_ratings.brand.team;

      // player_team_season.recruiting.team_season_buckets.dream.add(1);
      //TODO bring back
      recruit_team_seasons_by_team_season_id[team_season.team_season_id].push(rts);
    }

    player_count += 1;
    if (player_count % 1000 == 0) {
      console.log("showing player_count", { player_count: player_count });
    }
  }

  stopwatch(common, `Stopwatch RTS - Processed ${players_to_update.length} players`);

  var team_season_calls_tracker = {};
  var team_seasons_call_order_prep = [];
  var team_seasons_call_order = [];

  for (const team_season_id in team_seasons_by_team_season_id) {
    var team_season = team_seasons_by_team_season_id[team_season_id];
    var prep_obj = {
      team_season_id: team_season_id,
      order_tracker: [],
      brand_odds: team_season.team.team_ratings.brand ** 3,
    };
    prep_obj.recruit_calls_remaining = Math.ceil(team_season.team.team_ratings.brand + 10);

    var players_to_call = recruit_team_seasons_by_team_season_id[team_season_id];
    players_to_call = players_to_call.sort(
      (rts_a, rts_b) => rts_b.team_top_level_interest - rts_a.team_top_level_interest
    );
    team_season_calls_tracker[team_season_id] = {
      called_players: [],
      players_to_call: players_to_call,
    };
    team_seasons_call_order_prep.push(prep_obj);
  }

  stopwatch(common, `Stopwatch RTS - Prepped ${team_seasons_call_order_prep.length} teams`);

  var teams_waiting_to_call = team_seasons_call_order_prep.filter(
    (t_o) => t_o.recruit_calls_remaining > 0
  ).length;
  var loop_count = 0;
  // PERFTODO P * (N**2)
  // Find a way to change weighted_random_choice for this
  // Remove filter statements
  while (teams_waiting_to_call > 0) {
    var team_list = team_seasons_call_order_prep
      .filter((t_o) => t_o.recruit_calls_remaining > 0)
      .map((t_o) => [t_o.team_season_id, t_o.brand_odds + t_o.recruit_calls_remaining]);
    var chosen_team_season_id = weighted_random_choice(team_list);
    var chosen_team_obj = team_seasons_call_order_prep.find(
      (t_o) => t_o.team_season_id == chosen_team_season_id
    );

    chosen_team_obj.order_tracker.push(loop_count);
    loop_count += 1;

    chosen_team_obj.recruit_calls_remaining -= 1;
    team_seasons_call_order.push(parseInt(chosen_team_season_id));

    teams_waiting_to_call = team_seasons_call_order_prep.filter(
      (t_o) => t_o.recruit_calls_remaining > 0
    ).length;
  }

  stopwatch(common, `Stopwatch RTS - Teams did first calls`);

  var player_team_seasons_by_player_team_season_id = index_group_sync(
    player_team_seasons,
    "index",
    "player_team_season_id"
  );

  let recruit_team_seasons_to_save = [];

  for (const team_season_id of team_seasons_call_order) {
    let team_season_call_obj = team_season_calls_tracker[team_season_id];
    var team_season = team_seasons_by_team_season_id[team_season_id];

    let team_season_recruit_team_seasons_by_player_team_season_id = index_group_sync(
      recruit_team_seasons_by_team_season_id[team_season_id],
      "index",
      "player_team_season_id"
    );

    var player_called = null;
    while (player_called == null) {
      player_called = team_season_call_obj.players_to_call.shift();
      if (player_called == undefined) {
        break;
      }

      var player_called_player_team_season =
        player_team_seasons_by_player_team_season_id[player_called.player_team_season_id];
      var player_called_player_team_season_id =
        player_called_player_team_season.player_team_season_id;
      let player_call_options = player_call_tracker[player_called_player_team_season_id];

      // console.log({
      //   player_called_player_team_season_id:
      //     player_called_player_team_season_id,
      //   player_called_player_team_season: player_called_player_team_season,
      //   player_called: player_called,
      //   player_call_options: player_call_options,
      // });

      if (player_call_options.length == 0) {
        player_called = null;
      } else {
        var call_time = player_call_tracker[player_called_player_team_season_id].shift();

        var sorted_call_topics = Object.values(player_called.match_ratings).sort(
          (mv_a, mv_b) => mv_b.team - mv_a.team
        );

        for (const call_topic of sorted_call_topics.slice(0, call_time)) {
          let val = recruiting_pitch_value(
            player_called_player_team_season.recruiting.interests[call_topic.topic],
            call_topic.team
          );
          // console.log({
          //   val: val,
          //   "team_season_recruit_team_seasons_by_player_team_season_id[player_called_player_team_season.player_team_season_id]":
          //     team_season_recruit_team_seasons_by_player_team_season_id[
          //       player_called_player_team_season.player_team_season_id
          //     ],
          //   "team_season_recruit_team_seasons_by_player_team_season_id[player_called_player_team_season.player_team_season_id].match_rating":
          //     team_season_recruit_team_seasons_by_player_team_season_id[
          //       player_called_player_team_season.player_team_season_id
          //     ].match_rating,
          // });
          team_season_recruit_team_seasons_by_player_team_season_id[
            player_called_player_team_season.player_team_season_id
          ].match_rating += val;
        }
      }
    }

    team_season_call_obj.players_to_call.slice(0, 1).forEach(function (player_called) {
      var player_called_player_team_season =
        player_team_seasons_by_player_team_season_id[player_called.player_team_season_id];
      recruit_team_seasons_to_save.push(
        team_season_recruit_team_seasons_by_player_team_season_id[
          player_called_player_team_season.player_team_season_id
        ]
      );
    });
  }

  if (recruit_team_seasons_to_save.filter((rts) => rts.match_rating > 0).length == 0) {
    console.log("no match ratings", {
      recruit_team_seasons_to_save: recruit_team_seasons_to_save,
      recruit_team_seasons_by_team_season_id: recruit_team_seasons_by_team_season_id,
    });
  }

  stopwatch(common, `Stopwatch RTS - Teams did other? first calls`);

  console.log({ team_seasons: team_seasons });
  for (team_season of team_seasons) {
    delete team_season.team;
    delete team_season.stats;
    delete team_season.team_games;
  }

  console.log({
    player_team_seasons: player_team_seasons,
    team_seasons: team_seasons,
    recruit_team_seasons_to_save: recruit_team_seasons_to_save,
  });

  stopwatch(common, `Stopwatch RTS - Cleaning up data before saving`);

  db.player_team_season.update(player_team_seasons);
  db.team_season.update(team_seasons);
  db.recruit_team_season.insert(recruit_team_seasons_to_save);

  await db.saveDatabaseAsync();
  stopwatch(common, `Stopwatch RTS - Saved all RTSs WITH PROMISE`);
};

const class_is_in_college = (class_name) => {
  let class_map = {
    "HS JR": false,
    "HS SR": false,
    FR: true,
    SO: true,
    JR: true,
    SR: true,
    GR: false,
  };

  return class_map[class_name] || false;
};

const assign_player_jersey_numbers = async (common, season) => {
  const db = common.db;

  common.stopwatch(common, "Assigning jersey numbers - starting");
  let player_team_seasons = db.player_team_season.find({ season: season });
  let player_team_seasons_by_team_season_id = index_group_sync(
    player_team_seasons,
    "group",
    "team_season_id"
  );

  common.stopwatch(common, "Assigning jersey numbers - fetched PTSs");

  let player_ids = player_team_seasons.map((pts) => pts.player_id);
  let players = db.player.find({ player_id: { $in: player_ids } });
  let players_by_player_id = index_group_sync(players, "index", "player_id");

  common.stopwatch(common, "Assigning jersey numbers - Fetched Players");

  let player_team_seasons_to_save = [];
  let players_to_save = [];

  var url = "/data/import_json/position_numbers.json";
  var json_data = await fetch(url);
  var all_position_numbers = await json_data.json();

  common.stopwatch(common, "Assigning jersey numbers - Fetched default jersey nums");

  for (let [team_season_id, team_player_team_seasons] of Object.entries(
    player_team_seasons_by_team_season_id
  )) {
    let chosen_numbers = new Set(
      team_player_team_seasons
        .map((pts) => players_by_player_id[pts.player_id].jersey_number)
        .filter((num) => num)
    );
    let available_numbers = new Set(
      Array(99)
        .fill(1)
        .map((x, y) => x + y)
    );
    chosen_numbers.forEach(function (num) {
      available_numbers.delete(num);
    });

    console.log({
      chosen_numbers: chosen_numbers,
      available_numbers: available_numbers,
    });

    team_player_team_seasons = team_player_team_seasons.sort(
      (pts_a, pts_b) => pts_b.ratings.overall.overall - pts_a.ratings.overall.overall
    );
    team_player_team_seasons.forEach(function (pts) {
      let this_player = players_by_player_id[pts.player_id];

      let chosen_number = this_player.jersey_number;
      let loop_count = 0;
      while (chosen_number == null && loop_count < 100) {
        let try_chosen_number = -1;
        if (loop_count > 50) {
          try_chosen_number = weighted_random_choice(available_numbers, null);
        } else {
          try_chosen_number = weighted_random_choice(all_position_numbers[pts.position], null);
        }

        if (try_chosen_number && available_numbers.has(try_chosen_number)) {
          chosen_number = try_chosen_number;
        }

        loop_count += 1;
      }

      pts.jersey_number = chosen_number;
      this_player.jersey_number = chosen_number;

      player_team_seasons_to_save.push(pts);
      players_to_save.push(this_player);

      chosen_numbers.add(chosen_number);
      available_numbers.delete(chosen_number);
    });
  }

  common.stopwatch(common, "Assigning jersey numbers - Assigned all numbers");

  db.player_team_season.update(player_team_seasons_to_save);
  db.player.update(players_to_save);

  await db.saveDatabaseAsync();

  common.stopwatch(common, "Assigning jersey numbers - Saved & done");
};

const assign_players_to_teams = async (common, world_id, season, team_seasons) => {
  const db = common.db;

  const teams = db.team.find({ team_id: { $gt: 0 } });
  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  let player_team_seasons = db.player_team_season
    .find({ season: season, team_season_id: 0 })
    .filter((pts) => class_is_in_college(pts.class.class_name));

  let player_ids = player_team_seasons.map((pts) => pts.player_id);

  let players = db.player.find({ player_id: { $in: player_ids } });
  let players_by_player_id = index_group_sync(players, "index", "player_id");
  player_team_seasons = nest_children(
    player_team_seasons,
    players_by_player_id,
    "player_id",
    "player"
  );

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");

  index_group_sync(team_seasons, "index", "team_id");
  const team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  var team_position_options = [
    {
      QB: 6,
      RB: 5,
      FB: 1,
      WR: 8,
      TE: 4,
      OT: 5,
      IOL: 8,
      EDGE: 6,
      DL: 7,
      LB: 7,
      CB: 7,
      S: 4,
      K: 1,
      P: 2,
    },
    {
      QB: 4,
      RB: 5,
      FB: 1,
      WR: 8,
      TE: 4,
      OT: 4,
      IOL: 8,
      EDGE: 6,
      DL: 5,
      LB: 12,
      CB: 6,
      S: 5,
      K: 1,
      P: 2,
    },
    {
      QB: 4,
      RB: 5,
      FB: 1,
      WR: 9,
      TE: 3,
      OT: 5,
      IOL: 7,
      EDGE: 7,
      DL: 5,
      LB: 11,
      CB: 7,
      S: 4,
      K: 2,
      P: 1,
    },
    {
      QB: 3,
      RB: 8,
      FB: 1,
      WR: 7,
      TE: 5,
      OT: 5,
      IOL: 8,
      EDGE: 5,
      DL: 5,
      LB: 9,
      CB: 8,
      S: 4,
      K: 2,
      P: 1,
    },
    {
      QB: 5,
      RB: 6,
      FB: 1,
      WR: 10,
      TE: 4,
      OT: 4,
      IOL: 8,
      EDGE: 7,
      DL: 5,
      LB: 8,
      CB: 5,
      S: 5,
      K: 1,
      P: 2,
    },
  ];

  let max_prestige = 1;

  for (const team_season of team_seasons) {
    team_season.team_position_option = deep_copy(
      team_position_options[Math.floor(Math.random() * team_position_options.length)]
    );

    team_season.team_prestige =
      (3 * team_season.team.team_ratings.program_history +
        3 * team_season.team.team_ratings.brand +
        3 * team_season.team.team_ratings.team_competitiveness +
        3 * team_season.team.team_ratings.pro_pipeline +
        team_season.team.team_ratings.location) /
      13;
    max_prestige = Math.max(max_prestige, team_season.team_prestige);
  }

  let distance_tracking_map = {};
  player_team_seasons.forEach(function (pts) {
    pts.team_distances = {};
    team_seasons.forEach(function (ts) {
      pts.team_distances[ts.team_season_id] = distance_between_cities(
        ts.team.location,
        pts.player.hometown,
        distance_tracking_map
      );
    });
  });

  max_prestige += 3;

  for (const team_season of team_seasons) {
    team_season.prestige_lower_slice_ratio =
      1 - team_season.team_prestige ** 0.15 / max_prestige ** 0.15;
    team_season.prestige_upper_slice_ratio =
      1 - team_season.team_prestige ** 2.5 / max_prestige ** 2.5;
  }

  const player_team_seasons_by_position = index_group_sync(
    player_team_seasons,
    "group",
    "position"
  );
  console.log("player_team_seasons", {
    player_team_seasons_by_position: player_team_seasons_by_position,
    player_team_seasons: player_team_seasons,
  });

  let player_team_seasons_tocreate = [];

  for (const position in player_team_seasons_by_position) {
    var position_player_team_seasons = player_team_seasons_by_position[position];
    position_player_team_seasons = position_player_team_seasons.sort(
      (pts_a, pts_b) => pts_b.ratings.overall.potential - pts_a.ratings.overall.potential
    );

    let position_team_season_ids = team_seasons
      .map((ts) => Array(ts.team_position_option[position]).fill([ts.team_season_id]).flat())
      .flat();

    if (position == "P" || position == "K") {
      position_team_season_ids = shuffle(team_seasons.map((ts) => ts.team_season_id));
      position_team_season_ids = position_team_season_ids.concat(
        shuffle(team_seasons.map((ts) => ts.team_season_id))
      );
    } else {
      position_team_season_ids = shuffle(position_team_season_ids);
    }

    console.log({
      position_team_season_ids: position_team_season_ids,
      position_player_team_seasons: position_player_team_seasons,
    });

    for (const team_season_id of position_team_season_ids) {
      var team_season = team_seasons_by_team_season_id[team_season_id];

      var prestige_slice_lower_bound = Math.floor(
        position_player_team_seasons.length * team_season.prestige_lower_slice_ratio
      );
      var prestige_slice_upper_bound = Math.ceil(
        position_player_team_seasons.length * team_season.prestige_upper_slice_ratio
      );

      var prestige_slice_gap = prestige_slice_upper_bound - prestige_slice_lower_bound;
      // var r = Math.random();
      // var player_team_season_index = Math.floor(
      //   prestige_slice_lower_bound + (r * prestige_slice_gap)
      // );

      // var chosen_player_team_season = position_player_team_seasons.splice(
      //   player_team_season_index,
      //   1
      // );

      console.log({
        team_season: team_season,
        position_player_team_seasons: position_player_team_seasons,
        "team_season.prestige_upper_slice_ratio": team_season.prestige_upper_slice_ratio,
        "team_season.prestige_lower_slice_ratio": team_season.prestige_lower_slice_ratio,
        prestige_slice_gap: prestige_slice_gap,
        prestige_slice_upper_bound: prestige_slice_upper_bound,
        prestige_slice_lower_bound: prestige_slice_lower_bound,
      });
      let available_position_player_team_seasons = position_player_team_seasons.slice(
        prestige_slice_lower_bound,
        prestige_slice_upper_bound
      );
      let available_position_player_team_seasons_tuples =
        available_position_player_team_seasons.map(function (pts) {
          let dist_val = 800 - pts.team_distances[team_season_id];
          if (!(dist_val > 0)) {
            dist_val = 1;
          }
          return [pts, dist_val ** 2];
        });
      let chosen_player_team_season = weighted_random_choice(
        available_position_player_team_seasons_tuples
      );
      // console.log({available_position_player_team_seasons_tuples:available_position_player_team_seasons_tuples, chosen_player_team_season:chosen_player_team_season})

      if (chosen_player_team_season) {
        chosen_player_team_season.team_season_id = team_season_id;
        player_team_seasons_tocreate.push(chosen_player_team_season);
      } else {
        console.log("Didnt match player");
      }

      position_player_team_seasons = position_player_team_seasons.filter(
        (pts) => pts != chosen_player_team_season
      );
    }

    console.log({
      position: position,
      position_team_season_ids: position_team_season_ids,
      player_team_seasons: player_team_seasons,
      player_team_seasons_tocreate: player_team_seasons_tocreate,
    });
  }

  player_team_seasons_tocreate.forEach(function (pts) {
    delete pts.player;
    delete pts.team_distances;
  });

  console.log({ player_team_seasons_tocreate: player_team_seasons_tocreate });
  db.player_team_season.update(player_team_seasons_tocreate);

  await db.saveDatabaseAsync();
};

const create_coaches = async (data) => {
  const common = data.common;
  const db = common.db;
  var coaches_tocreate = [];
  var ethnicity_map = { white: 25, black: 25, hispanic: 25, asian: 25 };

  const positions = ["HC", "OC", "DC", "ST"];

  const num_coaches_to_create = positions.length * data.team_seasons.length;

  const coach_names = await common.random_name(ddb, num_coaches_to_create);
  const coach_cities = await common.random_city(ddb, num_coaches_to_create);

  var coach_counter = 0;

  let teams = db.team.find({ team_id: { $gt: 0 } });
  let team_brand_weights = teams.map((t) => [
    t.team_id,
    Math.floor(t.team_ratings.program_history ** 0.5),
  ]);

  var coach_id_counter = db.coach.nextId("coach_id");

  for (let team_season of data.team_seasons) {
    for (const coaching_position of positions) {
      let body = common.body_from_position("coach");
      let ethnicity = weighted_random_choice(ethnicity_map);
      let alma_mater_team_id = weighted_random_choice(team_brand_weights);
      var coach_obj = {
        coach_id: coach_id_counter,
        name: coach_names[coach_counter],
        world_id: data.world_id,
        coaching_position: coaching_position,
        hometown: coach_cities[coach_counter],
        ethnicity: ethnicity,
        body: body,
        alma_mater_team_id: parseInt(alma_mater_team_id),
      };

      coaches_tocreate.push(new coach(coach_obj));

      coach_counter += 1;
      coach_id_counter += 1;
    }
  }
  console.log({ coaches_tocreate: coaches_tocreate });
  db.coach.insert(coaches_tocreate);

  await db.saveDatabaseAsync();

};

const create_coach_team_seasons = async (data) => {
  const common = data.common;
  const db = common.db;
  common.season;

  const team_seasons = data.team_seasons;

  var coach_team_seasons_tocreate = [];
  let coach_team_season_id_counter = db.coach_team_season.nextId("coach_team_season_id");

  for (const coach of data.coaches) {
    var init_data = {
      coach_id: coach.coach_id,
      coach_team_season_id: coach_team_season_id_counter,
      team_season_id: -1,
      season: data.season,
      world_id: data.world_id,
      coaching_position: coach.coaching_position,
      age: Math.floor(Math.random() * 30) + 30,
    };

    var new_cts = new coach_team_season(init_data);

    coach_team_seasons_tocreate.push(new_cts);
    coach_team_season_id_counter += 1;
  }

  const coach_team_seasons_by_position = index_group_sync(
    coach_team_seasons_tocreate,
    "group",
    "coaching_position"
  );
  console.log({
    coach_team_seasons_tocreate: coach_team_seasons_tocreate,
    coach_team_seasons_by_position: coach_team_seasons_by_position,
  });
  coach_team_seasons_tocreate = [];

  for (const position in coach_team_seasons_by_position) {
    var coach_team_seasons = coach_team_seasons_by_position[position];

    let ind = 0;
    for (const team_season of team_seasons) {
      let chosen_coach_team_season = coach_team_seasons[ind];
      chosen_coach_team_season.team_season_id = team_season.team_season_id;

      chosen_coach_team_season.contract = {
        overall_years: 5,
        years_remaining: Math.floor(Math.random() * 5) + 1,
        compensation: 1_000_000,
        goals: {
          wins_per_season: { value: 6, importance: 10 },
          final_rank: { value: 25, importance: 8 },
        },
      };

      coach_team_seasons_tocreate.push(chosen_coach_team_season);

      ind += 1;
    }
  }

  db.coach_team_season.insert(coach_team_seasons_tocreate);

  await db.saveDatabaseAsync();

};

const generate_player_ratings = async (common, world_id, season) => {
  const db = common.db;

  let player_team_seasons = db.player_team_season.find({ season: season });

  var url = "/data/import_json/player_archetype.json";
  var json_data = await fetch(url);
  var position_archetypes = await json_data.json();
  console.log({
    url: url,
    player_team_seasons: player_team_seasons,
    position_archetypes: position_archetypes,
  });

  var position_overall_max = {};
  var position_overall_min = {};

  player_team_seasons
    .filter((pts) => pts.ratings)
    .forEach(function (pts) {
      pts.potential_ratings = deep_copy(pts.ratings);
    });
  for (let pts of player_team_seasons.filter((pts) => !pts.ratings)) {
    let position_archetype = deep_copy(position_archetypes[pts.position]["Balanced"]);
    pts.ratings = pts.ratings || {};
    pts.potential_ratings = {};
    for (const rating_group_key in position_archetype) {
      var rating_group = position_archetype[rating_group_key];

      pts.ratings[rating_group_key] = pts.ratings[rating_group_key] || {};
      pts.potential_ratings[rating_group_key] = {};
      for (const rating_key in rating_group) {
        var rating_obj = rating_group[rating_key];
        var rating_mean = rating_obj.rating_mean;

        var rating_value =
          pts.ratings[rating_group_key][rating_key] ||
          round_decimal(normal_trunc(rating_mean, rating_mean / 6.0, 1, 100), 0);

        pts.potential_ratings[rating_group_key][rating_key] = rating_value;

        let aged_out_rating_value = age_out_rating(
          rating_group_key,
          rating_key,
          rating_value,
          pts.class.class_name
        );

        // if (aged_out_rating_value < rating_value){
        //   console.log({
        //     rating_value:rating_value, aged_out_rating_value:aged_out_rating_value,rating_group_key:rating_group_key, rating_key:rating_key, 'pts.class.class_name': pts.class.class_name
        //   })
        //
        // }

        pts.ratings[rating_group_key][rating_key] = aged_out_rating_value;
      }
    }
  }

  for (let pts of player_team_seasons) {
    let overall_impact = 0;
    let potential_impact = 0;
    let position_archetype = deep_copy(position_archetypes[pts.position]["Balanced"]);
    // console.log({pts:pts})
    for (const rating_group_key in position_archetype) {
      var rating_group = position_archetype[rating_group_key];
      for (const rating_key in rating_group) {
        var rating_obj = rating_group[rating_key];
        var rating_mean = rating_obj.rating_mean;
        var rating_overall_impact = rating_obj.overall_impact;

        overall_impact +=
          (pts.ratings[rating_group_key][rating_key] - rating_mean) * rating_overall_impact;

        potential_impact +=
          (pts.potential_ratings[rating_group_key][rating_key] - rating_mean) *
          rating_overall_impact;
      }
    }

    pts.ratings.overall.overall = overall_impact;
    pts.ratings.overall.potential = potential_impact;
    // if (pts.ratings.overall.overall != pts.ratings.overall.potential && pts.class.class_name == 'FR'){
    //   console.log({
    //     'pts.ratings.overall.potential':pts.ratings.overall.potential,
    //     'pts.ratings.overall.overall': pts.ratings.overall.overall,
    //     potential_impact:potential_impact,
    //     overall_impact:overall_impact,
    //     pts:pts
    //   })
    // }

    if (!(pts.position in position_overall_max)) {
      position_overall_max[pts.position] = pts.ratings.overall.overall;
      position_overall_min[pts.position] = pts.ratings.overall.overall;
    }

    position_overall_max[pts.position] = Math.max(
      position_overall_max[pts.position],
      pts.ratings.overall.overall
    );
    position_overall_min[pts.position] = Math.min(
      position_overall_min[pts.position],
      pts.ratings.overall.overall
    );
  }

  var goal_overall_max = 99;
  var goal_overall_min = 40;
  var goal_overall_range = goal_overall_max - goal_overall_min;

  for (const pts of player_team_seasons) {
    let original_overall = pts.ratings.overall.overall;
    let original_potential = pts.ratings.overall.potential;

    pts.ratings.overall.overall = Math.floor(
      ((pts.ratings.overall.overall - position_overall_min[pts.position]) /
        (position_overall_max[pts.position] - position_overall_min[pts.position])) **
        1.5 *
        goal_overall_range +
        goal_overall_min
    );

    pts.ratings.overall.potential = Math.floor(
      ((pts.ratings.overall.potential - position_overall_min[pts.position]) /
        (position_overall_max[pts.position] - position_overall_min[pts.position])) **
        1.5 *
        goal_overall_range +
        goal_overall_min
    );

    if (!pts.ratings.overall.potential || !pts.ratings.overall.overall) {
      console.log("broken overall", {
        pts: pts,
        "pts.ratings.overall.potential ": pts.ratings.overall.potential,
        "pts.ratings.overall.overall": pts.ratings.overall.overall,
        goal_overall_range: goal_overall_range,
        "pts.position": pts.position,
        goal_overall_min: goal_overall_min,
        "position_overall_min[pts.position]": position_overall_min[pts.position],
        " position_overall_max[pts.position]": position_overall_max[pts.position],
        original_overall: original_overall,
        original_potential: original_potential,
      });
    }

    delete pts.potential_ratings;
  }

  console.log("setting ratings", { player_team_seasons: player_team_seasons });
  //
  db.player_team_season.update(player_team_seasons);
  await db.saveDatabaseAsync();

};

const create_new_players_and_player_team_seasons = async (
  common,
  world_id,
  season,
  team_seasons,
  classes
) => {
  const db = common.db;

  let players_tocreate = [];
  let player_team_seasons_tocreate = [];
  let player_team_season_stats_tocreate = [];

  const position_ethnicity =
    //numbers normalized from https://theundefeated.com/features/the-nfls-racial-divide/
    {
      QB: { white: 65, black: 25, hispanic: 5, asian: 5 },
      RB: { white: 25, black: 65, hispanic: 10, asian: 5 },
      FB: { white: 50, black: 50, hispanic: 15, asian: 2 },
      WR: { white: 25, black: 65, hispanic: 5, asian: 5 },
      TE: { white: 50, black: 50, hispanic: 15, asian: 2 },
      OT: { white: 45, black: 55, hispanic: 15, asian: 1 },
      IOL: { white: 40, black: 50, hispanic: 15, asian: 1 },
      EDGE: { white: 20, black: 80, hispanic: 10, asian: 1 },
      DL: { white: 10, black: 80, hispanic: 10, asian: 1 },
      LB: { white: 25, black: 75, hispanic: 10, asian: 1 },
      CB: { white: 10, black: 100, hispanic: 10, asian: 2 },
      S: { white: 15, black: 80, hispanic: 10, asian: 5 },
      K: { white: 70, black: 10, hispanic: 25, asian: 25 },
      P: { white: 70, black: 10, hispanic: 25, asian: 25 },
    };

  var team_position_counts = {
    QB: 1.25,
    RB: 1.5,
    FB: 0.5,
    WR: 2,
    TE: 1.25,
    OT: 1.25,
    IOL: 1.5,
    EDGE: 1.5,
    DL: 1.5,
    LB: 1.5,
    CB: 2,
    S: 1.25,
    K: 0.5,
    P: 0.5,
  };

  const num_players_per_team = sum(Object.values(team_position_counts));
  const num_players_to_create =
    Math.ceil(num_players_per_team) * team_seasons.length * classes.length;

  const player_names = await common.random_name(ddb, num_players_to_create);
  const player_cities = await common.random_city(ddb, num_players_to_create);

  var player_counter = 0;

  var player_id_counter = db.player.nextId("player_id");
  var player_team_season_id_counter = db.player_team_season.nextId("player_team_season_id");

  for (let position in team_position_counts) {
    let players_for_position = Math.floor(
      team_position_counts[position] * classes.length * team_seasons.length
    );

    for (let position_count = 0; position_count < players_for_position; position_count++) {
      let body = common.body_from_position(position);
      let ethnicity = weighted_random_choice(position_ethnicity[position]);
      let player_class = classes[Math.floor(Math.random() * classes.length)];

      if (player_counter > player_names.length || player_counter > player_cities.length) {
        console.log("something weird with names?", {
          player_names: player_names,
          player_cities: player_cities,
          player_counter: player_counter,
        });
      }

      var player_obj = new player({
        player_id: player_id_counter,
        name: player_names[player_counter],
        world_id: world_id,
        hometown: player_cities[player_counter],
        ethnicity: ethnicity,
        body: body,
        world_id: world_id,
        position: position,
      });

      let player_team_season_obj = new player_team_season({
        world_id: world_id,
        player_id: player_id_counter,
        player_team_season_id: player_team_season_id_counter,
        season: season,
        class: {
          class_name: player_class,
          redshirted: false,
        },
        team_season_id: 0,
        position: position,
      });

      if (player_class == "HS SR") {
        player_team_season_obj.team_season_id = -1 * season;
        player_team_season_obj.is_recruit = true;
        player_team_season_obj.recruiting = {
          speed: 1,
          stars: 4,
          signed: false,
          signed_team_season_id: null,
          stage: null,
          rank: {
            national: null,
            position_rank: null,
            state: null,
          },
          weeks: {},
          team_season_buckets: {
            dream: new Set(),
            favor: new Set(),
            indifferent: new Set(),
            hate: new Set(),
          },
          interests: {
            location: round_decimal(normal_trunc(3, 1.5, 1, 7), 0),
            fan_support: round_decimal(normal_trunc(3, 1.5, 1, 7), 0),
            academic_quality: round_decimal(normal_trunc_bounce(2, 10, 1, 7), 0),
            facilities: round_decimal(normal_trunc(3, 1.5, 1, 7), 0),
            program_history: round_decimal(normal_trunc(2.5, 1.5, 1, 7), 0),
            team_competitiveness: round_decimal(normal_trunc(3.5, 1.5, 1, 7), 0),
            brand: round_decimal(normal_trunc(3, 1.5, 1, 7), 0),
            pro_pipeline: round_decimal(normal_trunc(4, 1.5, 1, 7), 0),

            program_stability: round_decimal(normal_trunc(1.75, 0.1, 1, 7), 0),
            playing_time: round_decimal(normal_trunc(1.5, 0.1, 1, 7), 0),
            close_to_home: round_decimal(normal_trunc_bounce(4.5, 3, 1, 7), 0),
          },
        };
      } else {
        var new_player_team_season_stats = new player_team_season_stats(
          player_team_season_id_counter
        );
        player_team_season_stats_tocreate.push(new_player_team_season_stats);
      }

      players_tocreate.push(player_obj);
      player_team_seasons_tocreate.push(player_team_season_obj);

      player_counter += 1;
      player_id_counter += 1;
      player_team_season_id_counter += 1;
    }
  }

  console.log({
    players_tocreate: players_tocreate,
    player_team_seasons_tocreate: player_team_seasons_tocreate,
  });
  await Promise.all([
    db.player.insert(players_tocreate),
    db.player_team_season.insert(player_team_seasons_tocreate),
    db.player_team_season_stats.insert(player_team_season_stats_tocreate),
  ]);

  await db.saveDatabaseAsync();

};

const create_phase = async (season, common) => {
  const db = common.db;
  const phases_to_create = [
    { season: season, phase_name: "Pre-Season", is_current: true },
    { season: season, phase_name: "Regular Season", is_current: false },
    { season: season, phase_name: "End of Regular Season", is_current: false },
    { season: season, phase_name: "Bowl Season", is_current: false },
    { season: season, phase_name: "Season Recap", is_current: false },
    { season: season, phase_name: "Departures", is_current: false },
    { season: season, phase_name: "Off-Season Recruiting", is_current: false },
    { season: season, phase_name: "Summer Camp", is_current: false },
  ];

  let phase_id = db.phase.nextId("phase_id");
  for (let phase of phases_to_create) {
    phase.phase_id = phase_id;
    phase_id += 1;
  }
  const phases_to_create_added = db.phase.insert(phases_to_create);
  await db.saveDatabaseAsync();

  let phases = db.phase.find({ season: season });
  const phases_by_phase_name = index_group_sync(phases, "index", "phase_name");
  console.log({
    phases_by_phase_name: phases_by_phase_name,
    phases: phases,
    phases_to_create_added: phases_to_create_added,
    phase_id: phase_id,
  });
  return phases_by_phase_name;
};

const create_week = async (phases, common, world_id, season) => {
  const db = common.db;

  var weeks_to_create = [
    // {week_name:'Summer Week 1', is_current: false, phase_id: phases['Summer Camp']['phase_id'], schedule_week_number: null},
    // {week_name:'Summer Week 2', is_current: false, phase_id: phases['Summer Camp']['phase_id'], schedule_week_number: null},
    // {week_name:'Summer Week 3', is_current: false, phase_id: phases['Summer Camp']['phase_id'], schedule_week_number: null},
    // {week_name:'Summer Week 4', is_current: false, phase_id: phases['Summer Camp']['phase_id'], schedule_week_number: null},
    {
      week_name: "Plan for Season",
      short_name: "summer-plan",
      is_current: false,
      phase_id: phases["Summer Camp"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Pre-Season",
      short_name: "pre-season",
      is_current: false,
      phase_id: phases["Pre-Season"]["phase_id"],
      schedule_week_number: null,
    },

    {
      week_name: "Week 1",
      short_name: "week-01",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 1,
    },
    {
      week_name: "Week 2",
      short_name: "week-02",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 2,
    },
    {
      week_name: "Week 3",
      short_name: "week-03",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 3,
    },
    {
      week_name: "Week 4",
      short_name: "week-04",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 4,
    },
    {
      week_name: "Week 5",
      short_name: "week-05",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 5,
    },
    {
      week_name: "Week 6",
      short_name: "week-06",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 6,
    },
    {
      week_name: "Week 7",
      short_name: "week-07",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 7,
    },
    {
      week_name: "Week 8",
      short_name: "week-08",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 8,
    },
    {
      week_name: "Week 9",
      short_name: "week-09",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 9,
    },
    {
      week_name: "Week 10",
      short_name: "week-10",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 10,
    },
    {
      week_name: "Week 11",
      short_name: "week-11",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 11,
    },
    {
      week_name: "Week 12",
      short_name: "week-12",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 12,
    },
    {
      week_name: "Week 13",
      short_name: "week-13",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 13,
    },
    {
      week_name: "Week 14",
      short_name: "week-14",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 14,
    },
    {
      week_name: "Week 15",
      short_name: "week-15",
      is_current: false,
      phase_id: phases["Regular Season"]["phase_id"],
      schedule_week_number: 15,
    },

    {
      week_name: "Conference Championships",
      short_name: "conference-championships",
      is_current: false,
      phase_id: phases["End of Regular Season"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Early Signing Day",
      short_name: "early-signing-day",
      is_current: false,
      phase_id: phases["End of Regular Season"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Bowl Prep",
      short_name: "bowl-prep",
      is_current: false,
      phase_id: phases["End of Regular Season"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Bowl Week 1",
      short_name: "bowl-week-01",
      is_current: false,
      phase_id: phases["Bowl Season"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Bowl Week 2",
      short_name: "bowl-week-02",
      is_current: false,
      phase_id: phases["Bowl Season"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Bowl Week 3",
      short_name: "bowl-week-03",
      is_current: false,
      phase_id: phases["Bowl Season"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Bowl Week 4",
      short_name: "bowl-week-04",
      is_current: false,
      phase_id: phases["Bowl Season"]["phase_id"],
      schedule_week_number: null,
    },

    {
      week_name: "Season Recap",
      short_name: "season-recap",
      is_current: false,
      phase_id: phases["Season Recap"]["phase_id"],
      schedule_week_number: null,
    },

    {
      week_name: "Team Departures",
      short_name: "departures",
      is_current: false,
      phase_id: phases["Departures"]["phase_id"],
      schedule_week_number: null,
    },

    {
      week_name: "Recruiting Week 1",
      short_name: "recruiting-week-01",
      is_current: false,
      phase_id: phases["Off-Season Recruiting"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Recruiting Week 2",
      short_name: "recruiting-week-02",
      is_current: false,
      phase_id: phases["Off-Season Recruiting"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Recruiting Week 3",
      short_name: "recruiting-week-03",
      is_current: false,
      phase_id: phases["Off-Season Recruiting"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "Recruiting Week 4",
      short_name: "recruiting-week-04",
      is_current: false,
      phase_id: phases["Off-Season Recruiting"]["phase_id"],
      schedule_week_number: null,
    },
    {
      week_name: "National Signing Day",
      short_name: "signing-day",
      is_current: false,
      phase_id: phases["Off-Season Recruiting"]["phase_id"],
      schedule_week_number: null,
    },
  ];

  let week_id = db.week.nextId("week_id");

  for (let week of weeks_to_create) {
    week.week_updates = [];
    week.season = season;
    week.week_id = week_id;
    week.user_actions = {
      recruiting_actions_used: 0,
    };
    week.world_id = world_id;
    week.short_name = week.season + "-" + week.short_name;

    week_id += 1;
  }

  if (season == 2022) {
    weeks_to_create[1].is_current = true;
  }

  db.week.insert(weeks_to_create);
  await db.saveDatabaseAsync();

  return weeks_to_create;
};

const get_rivalries = async (teams) => {
  const team_names = teams.map((t) => t.school_name);

  var url = "/data/import_json/rivalries.json";
  var data = await fetch(url);
  var rival_dimension = await data.json();

  rival_dimension = rival_dimension.filter(
    (r) => team_names.includes(r.team_name_1) && team_names.includes(r.team_name_2)
  );

  rival_dimension = shuffle(rival_dimension);
  rival_dimension = rival_dimension.sort(function (a, b) {
    if (a.preferred_week_id == undefined) return 1;
    if (b.preferred_week_id == undefined) return 0;
    if (a.preferred_week_id < b.preferred_week_id) return -1;
    if (a.preferred_week_id > b.preferred_week_id) return 1;
    return 0;
  });

  return rival_dimension;
};

const get_teams = async () => {
  var url = "/data/import_json/team.json";
  var data = await fetch(url);
  var teams = await data.json();

  teams.forEach(function (t) {
    t.team_color_primary_hex = t.team_color_primary_hex.replace("#", "");
    t.team_color_secondary_hex = t.team_color_secondary_hex.replace("#", "");

    if (t.jersey.lettering_color) {
      t.jersey.lettering_color = t.jersey.lettering_color.replace("#", "");
    }

    t.field = t.field || {
      endzones: {
        style: "text",
        endzone_color: "407A21",
        text: t.school_name,
        text_color: t.team_color_primary_hex,
        text_border_color: "FFFFFF",
      },
    };
  });

  return teams;
};

const get_conferences = async (conference_version) => {
  conference_version = conference_version || "";

  var url = `/data/import_json/conference${conference_version}.json`;
  console.log({ url: url });
  var data = await fetch(url);
  var conferences = await data.json();
  console.log({ conferences: conferences });

  return conferences;
};

const random_name = async (ddb, num_names) => {
  var name_list = [];

  const first_name_list = ddb.first_names.find();
  const last_name_list = ddb.last_names.find();

  let final_first_name_obj = first_name_list[first_name_list.length - 1];
  let final_last_name_obj = last_name_list[last_name_list.length - 1];

  for (var i = 0; i <= num_names; i++) {
    const r_first = Math.floor(Math.random() * final_first_name_obj.stop);
    const r_last = Math.floor(Math.random() * final_last_name_obj.stop);

    const chosen_first = first_name_list.find((name_obj) => name_obj.stop > r_first);
    const chosen_last = last_name_list.find((name_obj) => name_obj.stop > r_last);

    name_list.push({ first: chosen_first.name, last: chosen_last.name });
  }
  return name_list;
};

const random_city = async (ddb, num_cities) => {
  let city_list = ddb.cities.find();
  let chosen_city_list = [];

  let total_occurance = sum(city_list.map((c) => c.occurance));

  for (var i = 0; i <= num_cities; i++) {
    let r_city = Math.floor(Math.random() * total_occurance);
    let chosen_city = city_list.find(function (city_obj) {
      r_city -= city_obj.occurance;
      return r_city <= 0;
    });
    chosen_city_list.push(chosen_city);
  }
  return chosen_city_list;
};
window.table_key_map = null;
window.reverse_table_key_map = null;

const resolve_route_parameters = async (pathname) => {
  let routes = [
    { route: "/", f: page_index },

    { route: "/admin", path: "admin/admin/base.html" },
    { route: "/admin/Database/:database", path: "admin/database/base.html" },
    { route: "/admin/Database/:database/Table/:table", path: "admin/table/base.html" },

    { route: "/World/:world_id/", f: page_world },
    // { route: "/World/:world_id/Week/:short_name/", f: page_world_week },
    { route: "/World/:world_id/Rankings/", f: page_world_rankings },
    { route: "/World/:world_id/Standings/", f: page_world_standings },
    {
      route: "/World/:world_id/Standings/Conference/:conference_id",
      path: "world/standings/base.html",
    },
    { route: "/World/:world_id/Schedule/", f: page_world_schedule },
    { route: "/World/:world_id/Awards/", f: page_world_awards },

    {
      route: "/World/:world_id/Conference/:conference_id",
      path: "conference/conference/base.html",
    },

    { route: "/World/:world_id/Recruiting/", path: "world/recruiting/base.html" },

    {
      route: "/World/:world_id/PlayerStats/Season/:season",
      f: page_almanac_player_stats
    },
    { route: "/World/:world_id/TeamStats/Season/:season", path: "almanac/team_stats/base.html" },

    { route: "/World/:world_id/History", f: page_almanac_history },
    { route: "/World/:world_id/PlayerRecords", f: page_almanac_player_records },
    { route: "/World/:world_id/TeamRecords", path: "almanac/team_records/base.html" },
    { route: "/World/:world_id/CoachStats", path: "almanac/coach_stats/base.html" },
    { route: "/World/:world_id/Shortlists", path: "almanac/shortlists/base.html" },
    { route: "/World/:world_id/AmazingStats", path: "almanac/amazing_stats/base.html" },
    {
      route: "/World/:world_id/AmazingStats/Season/:season/",
      path: "almanac/amazing_stats/base.html",
    },

    { route: "/World/:world_id/Team/:team_id/", f: page_team },
    { route: "/World/:world_id/Team/:team_id/Season/:season/", f: page_team },
    { route: "/World/:world_id/Team/:team_id/Schedule", f: page_team_schedule },
    {
      route: "/World/:world_id/Team/:team_id/Schedule/Season/:season/",
      f: page_team_schedule,
    },
    { route: "/World/:world_id/Team/:team_id/Roster", f: page_team_roster },
    {
      route: "/World/:world_id/Team/:team_id/Roster/Season/:season",
      f: page_team_roster,
    },
    { route: "/World/:world_id/Team/:team_id/Gameplan", path: "team/gameplan/base.html" },
    {
      route: "/World/:world_id/Team/:team_id/Gameplan/Season/:season",
      path: "team/gameplan/base.html",
    },
    { route: "/World/:world_id/Team/:team_id/History", f: page_team_history },

    { route: "/World/:world_id/Player/:player_id/", f: page_player },
    { route: "/World/:world_id/Coach/:coach_id/", path: "coach/coach/base.html" },

    { route: "/World/:world_id/Game/:game_id/", f: page_game },

    { route: "/World/:world_id/Search/:search_keyword/", path: "search/search/base.html" },

    { route: "", path: "static" },
    { route: "*html_templates*", path: "url" },
    { route: "*js/modules*", path: "url" },
    { route: "/*", path: "url" },
  ];

  const route_pattern_split = pathname.split("/").filter((str) => str.length > 0);
  const route_params = pathname.split("/").filter((str) => str.length > 0);

  routes.forEach(function (route) {
    route.route_parts = route.route.split("/").filter((str) => str.length > 0);
  });

  routes = routes.filter((route) => route.route_parts.length == route_params.length);
  routes = routes.filter(function (route) {
    route.params = {};
    for (let ind = 0; ind < route.route_parts.length; ind++) {
      if (route.route_parts[ind] != route_params[ind] && !route.route_parts[ind].includes(":")) {
        return false;
      } else if (route.route_parts[ind].includes(":")) {
        let key = route.route_parts[ind];
        key = key.replace(":", "");
        let val = route_params[ind];

        route.params[key] = val;
        if (/^\d+$/.test(val)) {
          route.params[key] = parseInt(val);
        }
      }
    }
    return true;
  });

  let winning_route = routes[0];

  console.log({
    routes: routes,
    winning_route: winning_route,
    route_params: route_params,
    route_pattern_split: route_pattern_split,
  });
  return winning_route;
};

const all_teams = async (common, link_suffix) => {
  const db = await common.db;
  var team_list = db.team.find({ team_id: { $gt: 0 } });
  team_list = team_list.sort(function (team_a, team_b) {
    if (team_a.school_name < team_b.school_name) return -1;
    if (team_a.school_name > team_b.school_name) return 1;
    return 0;
  });
  team_list = team_list.map((t) => Object.assign(t, { conference_id: t.conference.conference_id }));

  var conferences = db.conference.find();
  var conferences_by_conference_id = index_group_sync(conferences, "index", "conference_id");

  team_list = nest_children(team_list, conferences_by_conference_id, "conference_id", "conference");
  team_list = team_list.map((t) =>
    Object.assign(t, { adjusted_team_href: t.team_href + link_suffix })
  );

  var team_return_obj = { all_teams: team_list, conferences: conferences };
  return team_return_obj;
};

const all_seasons = async (common, link) => {
  const db = await common.db;
  var season_list = db.league_season.find();

  season_list = season_list.map((s) => Object.assign(s, { href: link + s.season }));
  console.log({ link: link, season_list: season_list });
  return season_list;
};

const common_functions = async (path) => {
  let winning_route = await resolve_route_parameters(path);
  console.log({
    path: path,
    winning_route: winning_route,
  });
  const params = winning_route.params;
  const world_id = params.world_id;

  var world_object = {};
  const ddb = await driver_db();
  if (world_id != undefined) {
    world_object = ddb.world.findOne({ world_id: world_id });
  }

  let db = null;
  if (world_id) {
    db = await resolve_db({ database_id: world_id });
  }

  return {
    winning_route: winning_route,
    get_teams: get_teams,
    get_rivalries: get_rivalries,
    get_conferences: get_conferences,
    new_world_action: new_world_action,
    create_phase: create_phase,
    create_week: create_week,
    create_coaches: create_coaches,
    populate_all_depth_charts: populate_all_depth_charts,
    choose_preseason_all_americans: choose_preseason_all_americans,
    create_schedule: create_schedule,
    create_conference_seasons: create_conference_seasons,
    calculate_team_overalls: calculate_team_overalls,
    nav_bar_links: nav_bar_links,
    db: db,
    ddb: ddb,
    world_id: world_id,
    world_object: world_object,
    params: params,
    season: world_object.current_season,
    random_name: random_name,
    random_city: random_city,
    body_from_position: body_from_position,
    recent_games: recent_games,
    all_teams: all_teams,
    all_seasons: all_seasons,
    initialize_scoreboard: initialize_scoreboard,
    round_decimal: round_decimal,
    distance_between_cities: distance_between_cities,
    distance_between_coordinates: distance_between_coordinates,
    calculate_national_rankings: calculate_national_rankings,
    calculate_conference_rankings: calculate_conference_rankings,
    schedule_bowl_season: schedule_bowl_season,
    process_bowl_results: process_bowl_results,
    weekly_recruiting: weekly_recruiting,
    calculate_team_needs: calculate_team_needs,
    populate_player_modal: populate_player_modal,
    geo_marker_action: geo_marker_action,
    tier_placement: tier_placement,

    stopwatch: stopwatch,
    choose_all_americans: choose_all_americans,
    primary_color: "1763B2",
    secondary_color: "333333",
  };
};

const stopwatch = async (common, message) => {
  var currentTime = performance.now();
  window.lastStopwatch = window.lastStopwatch || common.startTime;
  console.log(
    `${message}- total time: ${parseInt(currentTime - common.startTime)} ms, since last: ${parseInt(
      currentTime - window.lastStopwatch
    )} ms`
  );
  window.lastStopwatch = currentTime;
};

const recent_games = (common) => {
  const season = common.season;
  const db = common.db;
  const all_weeks = db.week.find({ season: season });
  const current_week = all_weeks.filter((w) => w.is_current)[0];

  const all_weeks_by_week_id = index_group_sync(all_weeks, "index", "week_id");

  const previous_week = all_weeks_by_week_id[current_week.week_id - 1];

  if (previous_week == undefined) {
    return null;
  }

  var games_in_week = db.game.find({ week_id: previous_week.week_id });

  const team_seasons_b = db.team_season.find({ season: season });
  const team_seasons = team_seasons_b.filter((ts) => ts.team_id > 0);
  const team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  const teams = db.team.find({ team_id: { $gt: 0 } });
  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  const team_games = db.team_game.find({ week_id: previous_week.week_id });
  for (var team_game of team_games) {
    team_game.team_season = team_seasons_by_team_season_id[team_game.team_season_id];
    team_game.team_season.team = teams_by_team_id[team_game.team_season.team_id];
  }

  const team_games_by_game_id = index_group_sync(team_games, "group", "game_id");
  for (var game of games_in_week) {
    game.team_games = team_games_by_game_id[game.game_id];

    let max_national_rank = 0;

    if (game.team_games[0].is_winning_team) {
      max_national_rank =
        team_seasons_by_team_season_id[game.team_games[1].team_season_id].national_rank;
    } else {
      max_national_rank =
        team_seasons_by_team_season_id[game.team_games[0].team_season_id].national_rank;
    }

    game.has_user_team = game.team_games.some((tg) => tg.team_season.is_user_team);

    game.summed_national_rank =
      team_seasons_by_team_season_id[game.team_games[0].team_season_id].national_rank +
      team_seasons_by_team_season_id[game.team_games[1].team_season_id].national_rank +
      max_national_rank;
  }

  games_in_week = games_in_week.sort(function (g_a, g_b) {
    if (g_a.has_user_team) return -1;
    if (g_b.has_user_team) return 1;
    if (g_a.summed_national_rank < g_b.summed_national_rank) return -1;
    if (g_a.summed_national_rank > g_b.summed_national_rank) return 1;
    return 0;
  });

  return games_in_week;
};

const populate_sim_modal = async (html, game_dict) => {
  let renderedHtml = nunjucks_env.renderString(html, game_dict);
  $(".modal-body").append(renderedHtml);
};


const sim_week_games = async (this_week, common) => {
  $(".modal-body").empty();
  $(".modal-body").append(
    `<div class='width100 left-text'>Simulating <span class=''>${this_week.week_name}</span></div>`
  );

  var url = "/html_templates/common_templates/sim_game_modal_result_table.njk";
  var html = await fetch(url);
  html = await html.text();

  if (!window.playcall) {
    var playcall_url = "/data/import_json/playcall.json";
    var playcall_html = await fetch(playcall_url);
    window.playcall = await playcall_html.json();
  }

  const db = await common.db;
  var startTime = performance.now();
  common.startTime = startTime;

  var team_games_this_week = db.team_game.find({ week_id: this_week.week_id });
  let team_games_by_game_id = index_group_sync(team_games_this_week, "group", "game_id");

  var team_season_ids_playing_this_week = team_games_this_week.map((tg) => tg.team_season_id);

  let [team_seasons, team_season_stats] = await Promise.all([
    db.team_season.find({ team_season_id: { $in: team_season_ids_playing_this_week } }),
    db.team_season_stats.find({ team_season_id: { $in: team_season_ids_playing_this_week } }),
  ]);

  const team_season_stats_by_team_season_id = index_group_sync(
    team_season_stats,
    "index",
    "team_season_id"
  );
  team_seasons = nest_children(
    team_seasons,
    team_season_stats_by_team_season_id,
    "team_season_id",
    "stats"
  );

  let user_team_season = team_seasons.find((ts) => ts.is_user_team);
  let user_team_season_id = user_team_season ? user_team_season.team_season_id : 0;

  var team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  let [teams, player_team_seasons] = await Promise.all([
    db.team.find({ team_id: { $gt: 0 } }),
    db.player_team_season.find({ team_season_id: { $in: team_season_ids_playing_this_week } }),
  ]);

  var teams_by_team_id = index_group_sync(teams, "index", "team_id");
  var player_team_seasons_by_team_season_id = index_group_sync(
    player_team_seasons,
    "group",
    "team_season_id"
  );

  var player_ids = player_team_seasons.map((pts) => pts.player_id);
  var player_team_season_ids = player_team_seasons.map((pts) => pts.player_team_season_id);

  console.log({
    "db.player_team_season_stats": db.player_team_season_stats,
    player_team_season_ids: player_team_season_ids,
  });
  const player_team_season_stats = db.player_team_season_stats.find({
    player_team_season_id: { $in: player_team_season_ids },
  });
  const player_team_season_stats_by_player_team_season_id = index_group_sync(
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

  let player_team_game_id_counter = db.player_team_game.nextId("player_team_game_id");
  let headline_id_counter = db.headline.nextId("headline_id");
  let players = db.player.find({ player_id: { $in: player_ids } });
  let games_this_week = db.game.find({ week_id: this_week.week_id });

  const players_by_player_id = index_group_sync(players, "index", "player_id");

  games_this_week = games_this_week.filter((g) => g.was_played == false);
  games_this_week = games_this_week.sort(function (g_a, g_b) {
    if (
      g_a.home_team_season_id == user_team_season_id ||
      g_a.away_team_season_id == user_team_season_id
    ) {
      return -1;
    } else if (
      g_b.home_team_season_id == user_team_season_id ||
      g_b.away_team_season_id == user_team_season_id
    ) {
      return 1;
    } else {
      return g_a.summed_national_rank - g_b.summed_national_rank;
    }
  });

  var game_dicts_this_week = [];
  common.headline_id_counter = headline_id_counter;

  await games_this_week.forEach(async function (game) {
    let game_dict = { game: game };
    let team_games = team_games_by_game_id[game.game_id].sort(function (a, b) {
      if (a.is_home_team) return 1;
      if (b.is_home_team) return -1;
      return 0;
    });

    let team_seasons = [];
    let teams = [];

    for (let tg of team_games) {
      team_seasons.push(team_seasons_by_team_season_id[tg.team_season_id]);
    }

    for (let ts of team_seasons) {
      teams.push(teams_by_team_id[ts.team_id]);
    }

    game_dict.team_games = team_games;
    game_dict.team_seasons = team_seasons;
    game_dict.teams = teams;

    game_dicts_this_week.push(game_dict);

    console.log({ game_dict: game_dict });

    await populate_sim_modal(html, game_dict);

  });

  for (const game_dict of game_dicts_this_week) {
    var ind = 0;
    let player_team_seasons = [];
    let players = [];
    let players_list = [];
    let player_team_games = {};

    for (let team_season of game_dict.team_seasons) {
      var player_team_seasons_to_add = index_group_sync(
        player_team_seasons_by_team_season_id[team_season.team_season_id],
        "index",
        "player_team_season_id"
      );
      player_team_seasons = {
        ...player_team_seasons,
        ...player_team_seasons_to_add,
      };

      for (let player_team_season_id in player_team_seasons_to_add) {
        let pts = player_team_seasons_to_add[player_team_season_id];
        pts.games_played += 1;
        pts.team_games_played += 1;
        let new_player_team_game = new player_team_game(
          player_team_game_id_counter,
          game_dict.team_games[ind].team_game_id,
          pts.player_team_season_id
        );

        player_team_games[player_team_season_id] = new_player_team_game;

        player_team_game_id_counter += 1;
      }

      players_list = player_team_seasons_by_team_season_id[team_season.team_season_id].map(
        (pts) => players_by_player_id[pts.player_id]
      );

      var players_to_add = index_group_sync(players_list, "index", "player_id");
      players = { ...players, ...players_to_add };
      ind += 1;
    }

    game_dict.player_team_seasons = player_team_seasons;
    game_dict.players = players;
    game_dict.player_team_games = player_team_games;
    game_dict.headlines = [];
  }

  var completed_games = [],
    completed_game = undefined;

  for (const game_dict of game_dicts_this_week) {
    console.log({ game_dict: game_dict });
    completed_game = sim_game(game_dict, common);
    completed_games.push(completed_game);
  }

  common.stopwatch(common, "Done simming games");

  var game_ids_to_save = [];
  var games_to_save = [];

  var team_game_ids_to_save = [];
  var team_games_to_save = [];

  var team_seasons_to_save = [];
  var team_season_stats_to_save = [];
  var player_team_games_to_save = [];
  var player_team_seasons_to_save = [];
  var player_team_season_stats_to_save = [];
  var headlines_to_save = [];

  for (completed_game of completed_games) {
    game_ids_to_save.push(completed_game.game_id);

    delete completed_game.game.home_team_season;
    delete completed_game.game.away_team_season;

    games_to_save.push(completed_game.game);

    for (let tg of completed_game.team_games) {
      team_game_ids_to_save.push(tg.team_game_id);
      for (let [game_stat_group_name, game_stat_group] of Object.entries(tg.game_stats)) {
        for (let [stat_name, stat_value] of Object.entries(game_stat_group)) {
          if (!stat_value) {
            delete tg.game_stats[game_stat_group_name][stat_name];
          }
        }
      }
      for (let [game_stat_group_name, game_stat_group] of Object.entries(tg.opponent_game_stats)) {
        for (let [stat_name, stat_value] of Object.entries(game_stat_group)) {
          if (!stat_value) {
            delete tg.opponent_game_stats[game_stat_group_name][stat_name];
          }
        }
      }
      team_games_to_save.push(tg);
    }

    for (let ts of completed_game.team_seasons) {
      team_season_stats_to_save.push(ts.stats);
      delete ts.stats;
      delete ts.team_games;
      team_seasons_to_save.push(ts);
    }

    for (let [player_team_game_id, ptg] of Object.entries(completed_game.player_team_games)) {
      if (ptg.game_stats.games.games_played > 0) {
        delete ptg.game_attrs;
        for (let [game_stat_group_name, game_stat_group] of Object.entries(ptg.game_stats)) {
          for (let [stat_name, stat_value] of Object.entries(game_stat_group)) {
            if (!stat_value) {
              // console.log({
              //   game_stat_group_name:game_stat_group_name, stat_name:stat_name, ptg:ptg, 'ptg.game_stats': ptg.game_stats
              // })
              delete ptg.game_stats[game_stat_group_name][stat_name];
            }
          }
        }
        player_team_games_to_save.push(ptg);
      }
    }

    for (let [player_team_season_id, pts] of Object.entries(completed_game.player_team_seasons)) {
      for (let [game_stat_group_name, game_stat_group] of Object.entries(pts.season_stats)) {
        for (let [stat_name, stat_value] of Object.entries(game_stat_group)) {
          if (!stat_value) {
            delete pts.season_stats[game_stat_group_name][stat_name];
          }
        }
      }

      player_team_season_stats_to_save.push(pts.season_stats);
      delete pts.season_stats;
      player_team_seasons_to_save.push(pts);
    }

    for (let hdl of completed_game.headlines) {
      headlines_to_save.push(hdl);
    }
  }

  common.stopwatch(common, "Done compiling stats");

  await Promise.all([
    db.game.update(games_to_save),
    db.team_game.update(team_games_to_save),
    db.team_season.update(team_seasons_to_save),
    db.team_season_stats.update(team_season_stats_to_save),
    db.player_team_season_stats.update(player_team_season_stats_to_save),
    db.player_team_season.update(player_team_seasons_to_save),
    db.player_team_game.insert(player_team_games_to_save),
    db.headline.insert(headlines_to_save),
  ]);

  await db.saveDatabaseAsync();


  common.stopwatch(common, "Done compiling stats");

  var endTime = performance.now();
  console.log(`Time taken to render HTML: ${parseInt(endTime - startTime)} ms`);
};

const calculate_team_needs = async (common, team_season_ids = null) => {
  var startTime = performance.now();

  const db = await common.db;
  const season = common.season;

  let team_seasons = [];

  if (!team_season_ids) {
    team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });
    team_season_ids = team_seasons.map((ts) => ts.team_season_id);
  } else {
    team_seasons = db.team_season.find({ team_season_id: { $in: team_season_ids } });
  }

  const player_team_seasons = db.player_team_season.find({
    team_season_id: { $in: team_season_ids },
  });
  const player_team_seasons_by_player_team_season_id = index_group_sync(
    player_team_seasons,
    "index",
    "player_team_season_id"
  );

  const position_starters_map = {
    QB: [1, 0.05],
    RB: [1, 0.4],
    FB: [0.2],
    WR: [1, 1, 0.75, 0.25, 0.1],
    TE: [1, 0.5],
    OT: [1, 1, 0.2],
    IOL: [1, 1, 1, 0.2],
    EDGE: [1, 1, 0.5, 0.25],
    DL: [1, 0.9, 0.4, 0.25],
    LB: [1, 1, 1, 0.75, 0.25],
    CB: [1, 1, 0.6, 0.25],
    S: [1, 1, 0.4],
    K: [1],
    P: [1],
  };

  const overall_list = [99, 95, 90, 85, 80, 75, 70, 65, 60, 55, 45, 30, 0];

  const class_map = {
    SR: 0,
    "SR (RS)": 0,
    JR: 1,
    "JR (RS)": 1,
    SO: 2,
    "SO (RS)": 2,
    FR: 3,
    "FR (RS)": 3,
    "HS SR": 4,
  };

  for (const team_season of team_seasons) {
    team_season.recruiting.position_needs = {};
    for (const [position, player_team_season_ids] of Object.entries(
      team_season.depth_chart_with_recruits
    )) {
      team_season.recruiting.position_needs[position] = [];
      let position_player_overalls = player_team_season_ids.map((pts_id) => ({
        class_val: class_map[player_team_seasons_by_player_team_season_id[pts_id].class.class_name],
        class: player_team_seasons_by_player_team_season_id[pts_id].class.class_name,
        overall: player_team_seasons_by_player_team_season_id[pts_id].ratings.overall.overall,
      }));
      position_player_overalls = position_player_overalls.filter(
        (pts_obj) => pts_obj.class_val > 0
      );

      for (const overall of overall_list) {
        let overall_obj = { overall: overall, playing_time_val: 0 };
        for (const class_val of [1, 2, 3, 4]) {
          let year_position_player_overalls = position_player_overalls.filter(
            (pts_obj) => pts_obj.class_val >= class_val
          );
          let overall_index = year_position_player_overalls.findIndex(
            (pts_obj) => pts_obj.overall < overall
          );
          if (overall_index == -1) {
            overall_index = year_position_player_overalls.length;
          }
          let overall_playtime_modifier = position_starters_map[position][overall_index] || 0;
          overall_obj.playing_time_val += overall_playtime_modifier;
        }
        overall_obj.playing_time_val = Math.ceil(overall_obj.playing_time_val * 5);
        team_season.recruiting.position_needs[position].push(overall_obj);
      }
    }
  }

  // team_seasons.forEach((ts) => delete ts.recruiting);

  db.team_season.update(team_seasons);

  await db.saveDatabaseAsync();


  var endTime = performance.now();
  console.log(`Time taken to calculate_team_needs: ${parseInt(endTime - startTime)} ms`);
};

const calculate_team_overalls = async (common) => {
  const db = await common.db;
  const season = common.season;
  const team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });

  const position_map = {
    QB: { group: "Offense", unit: "QB", typical_starters: 1 },
    RB: { group: "Offense", unit: "RB", typical_starters: 1 },
    FB: { group: "Offense", unit: "FB", typical_starters: 1 },
    WR: { group: "Offense", unit: "REC", typical_starters: 2 },
    TE: { group: "Offense", unit: "REC", typical_starters: 1 },
    OT: { group: "Offense", unit: "OL", typical_starters: 2 },
    IOL: { group: "Offense", unit: "OL", typical_starters: 3 },

    EDGE: { group: "Defense", unit: "DL", typical_starters: 2 },
    DL: { group: "Defense", unit: "DL", typical_starters: 2 },
    LB: { group: "Defense", unit: "LB", typical_starters: 3 },
    CB: { group: "Defense", unit: "DB", typical_starters: 2 },
    S: { group: "Defense", unit: "DB", typical_starters: 2 },

    K: { group: "Special Teams", unit: "ST", typical_starters: 1 },
    P: { group: "Special Teams", unit: "ST", typical_starters: 1 },
  };

  var rating_min_max = {
    overall: { min: 100, max: 0 },
    by_position_group: {},
    by_position_unit: {},
    by_position: {},
  };

  for (const position in position_map) {
    var position_obj = position_map[position];
    if (!(position in rating_min_max.by_position)) {
      rating_min_max.by_position[position] = { min: 100, max: 0 };
    }
    if (!(position_obj.group in rating_min_max.by_position_group)) {
      rating_min_max.by_position_group[position_obj.group] = {
        min: 100,
        max: 0,
      };
    }
    if (!(position_obj.unit in rating_min_max.by_position_unit)) {
      rating_min_max.by_position_unit[position_obj.unit] = { min: 100, max: 0 };
    }
  }

  console.log({ team_seasons: team_seasons });
  var player_team_season_ids = team_seasons
    .map((ts) =>
      Object.entries(ts.depth_chart)
        .map((pos_obj) => pos_obj[1].slice(0, position_map[pos_obj[0]].typical_starters))
        .flat()
    )
    .flat();
  const player_team_seasons = db.player_team_season.find({
    player_team_season_id: { $in: player_team_season_ids },
  });
  const player_team_seasons_by_player_team_season_id = index_group_sync(
    player_team_seasons,
    "index",
    "player_team_season_id"
  );

  for (const team_season of team_seasons) {
    team_season.rating = {
      overall: { sum: 0, count: 0 },
      by_position: {},
      by_position_group: {},
      by_position_unit: {},
    };

    for (const position in position_map) {
      var position_obj = position_map[position];
      var position_unit = position_obj.unit;
      var position_group = position_obj.group;

      if (!(position in team_season.rating.by_position)) {
        team_season.rating.by_position[position] = { sum: 0, count: 0 };
      }
      if (!(position_group in team_season.rating.by_position_group)) {
        team_season.rating.by_position_group[position_group] = {
          sum: 0,
          count: 0,
        };
      }
      if (!(position_unit in team_season.rating.by_position_unit)) {
        team_season.rating.by_position_unit[position_unit] = {
          sum: 0,
          count: 0,
        };
      }

      var player_team_season_ids = team_season.depth_chart[position].slice(
        0,
        position_map[position].typical_starters
      );

      var overall_sum = player_team_season_ids
        .map(
          (pts_id) => player_team_seasons_by_player_team_season_id[pts_id].ratings.overall.overall
        )
        .reduce((acc, val) => acc + val, 0);

      team_season.rating.overall.count += position_map[position].typical_starters;
      team_season.rating.by_position[position].count += position_map[position].typical_starters;
      team_season.rating.by_position_group[position_group].count +=
        position_map[position].typical_starters;
      team_season.rating.by_position_unit[position_unit].count +=
        position_map[position].typical_starters;

      team_season.rating.overall.sum += overall_sum;
      team_season.rating.by_position[position].sum += overall_sum;
      team_season.rating.by_position_group[position_group].sum += overall_sum;
      team_season.rating.by_position_unit[position_unit].sum += overall_sum;
    }

    team_season.rating.overall = round_decimal(
      team_season.rating.overall.sum / team_season.rating.overall.count,
      1
    );

    rating_min_max.overall.max = Math.max(rating_min_max.overall.max, team_season.rating.overall);
    rating_min_max.overall.min = Math.min(rating_min_max.overall.min, team_season.rating.overall);

    for (const position in team_season.rating.by_position) {
      team_season.rating.by_position[position] = round_decimal(
        team_season.rating.by_position[position].sum /
          team_season.rating.by_position[position].count,
        1
      );

      rating_min_max.by_position[position].max = Math.max(
        rating_min_max.by_position[position].max,
        team_season.rating.by_position[position]
      );
      rating_min_max.by_position[position].min = Math.min(
        rating_min_max.by_position[position].min,
        team_season.rating.by_position[position]
      );
    }
    for (const position_group in team_season.rating.by_position_group) {
      team_season.rating.by_position_group[position_group] = round_decimal(
        team_season.rating.by_position_group[position_group].sum /
          team_season.rating.by_position_group[position_group].count,
        1
      );

      //	console.log({rating_min_max:rating_min_max, position_group:position_group, 'team_season.rating.by_position_group': team_season.rating.by_position_group})

      rating_min_max.by_position_group[position_group].max = Math.max(
        rating_min_max.by_position_group[position_group].max,
        team_season.rating.by_position_group[position_group]
      );
      rating_min_max.by_position_group[position_group].min = Math.min(
        rating_min_max.by_position_group[position_group].min,
        team_season.rating.by_position_group[position_group]
      );
    }
    for (const position_unit in team_season.rating.by_position_unit) {
      team_season.rating.by_position_unit[position_unit] = round_decimal(
        team_season.rating.by_position_unit[position_unit].sum /
          team_season.rating.by_position_unit[position_unit].count,
        1
      );

      rating_min_max.by_position_unit[position_unit].max = Math.max(
        rating_min_max.by_position_unit[position_unit].max,
        team_season.rating.by_position_unit[position_unit]
      );
      rating_min_max.by_position_unit[position_unit].min = Math.min(
        rating_min_max.by_position_unit[position_unit].min,
        team_season.rating.by_position_unit[position_unit]
      );
    }
  }

  var goal_overall_max = 99;
  var goal_overall_min = 40;
  var goal_overall_range = goal_overall_max - goal_overall_min;

  for (const team_season of team_seasons) {
    team_season.rating.overall = Math.floor(
      ((team_season.rating.overall - rating_min_max.overall.min) * goal_overall_range) /
        (rating_min_max.overall.max - rating_min_max.overall.min) +
        goal_overall_min
    );

    for (const position in team_season.rating.by_position) {
      team_season.rating.by_position[position] = Math.floor(
        ((team_season.rating.by_position[position] - rating_min_max.by_position[position].min) *
          goal_overall_range) /
          (rating_min_max.by_position[position].max - rating_min_max.by_position[position].min) +
          goal_overall_min
      );
    }
    for (const position_group in team_season.rating.by_position_group) {
      team_season.rating.by_position_group[position_group] = Math.floor(
        ((team_season.rating.by_position_group[position_group] -
          rating_min_max.by_position_group[position_group].min) *
          goal_overall_range) /
          (rating_min_max.by_position_group[position_group].max -
            rating_min_max.by_position_group[position_group].min) +
          goal_overall_min
      );
    }
    for (const position_unit in team_season.rating.by_position_unit) {
      team_season.rating.by_position_unit[position_unit] = Math.floor(
        ((team_season.rating.by_position_unit[position_unit] -
          rating_min_max.by_position_unit[position_unit].min) *
          goal_overall_range) /
          (rating_min_max.by_position_unit[position_unit].max -
            rating_min_max.by_position_unit[position_unit].min) +
          goal_overall_min
      );
    }
  }

  db.team_season.update(team_seasons);
  await db.saveDatabaseAsync();

};

const calculate_primetime_games = async (this_week, all_weeks, common) => {
  const db = common.db;
  const season = common.season;

  let next_week = db.week.findOne({ week_id: this_week.week_id + 1 });

  if (!next_week) {
    return null;
  }

  let games = db.game.find({ week_id: next_week.week_id });

  let teams = db.team.find();
  let teams_by_team_id = index_group_sync(teams, "index", "team_id");

  let team_seasons = db.team_season.find({ season: season });
  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");

  let team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  games
    .filter((g) => g.home_team_season_id > 0)
    .forEach(function (g) {
      g.home_team_season = team_seasons_by_team_season_id[g.home_team_season_id];
      g.away_team_season = team_seasons_by_team_season_id[g.away_team_season_id];

      let min_national_rank = Math.min(
        g.home_team_season.national_rank,
        g.away_team_season.national_rank
      );
      g.summed_national_rank = g.home_team_season.national_rank + g.away_team_season.national_rank;

      g.summed_national_rank -= Math.floor(g.home_team_season.team.team_ratings.brand / 4);
      g.summed_national_rank -= Math.floor(g.away_team_season.team.team_ratings.brand / 4);

      if (g.home_team_season.conference_season_id == g.away_team_season.conference_season_id) {
        if (next_week.schedule_week_number >= 13) {
          if (
            g.home_team_season.record.conference_gb <= 0.5 &&
            g.away_team_season.record.conference_gb <= 0.5
          ) {
            g.summed_national_rank -= 14;
          } else if (
            g.home_team_season.record.conference_gb <= 1.5 &&
            g.away_team_season.record.conference_gb <= 1.5
          ) {
            g.summed_national_rank -= 7;
          }
        } else if (next_week.schedule_week_number >= 8) {
          if (
            g.home_team_season.record.conference_gb <= 0.5 &&
            g.away_team_season.record.conference_gb <= 0.5
          ) {
            g.summed_national_rank -= 7;
          } else if (
            g.home_team_season.record.conference_gb <= 1.5 &&
            g.away_team_season.record.conference_gb <= 1.5
          ) {
            g.summed_national_rank -= 3;
          }
        }

        delete g.home_team_season;
        delete g.away_team_season;
      }

      if (g.rivalry_game) {
        g.summed_national_rank -= min_national_rank;
      }
    });

  games = games.sort((g_a, g_b) => g_a.summed_national_rank - g_b.summed_national_rank);
  let primetime_games = games.slice(0, 5);

  console.log({ games: games, primetime_games: primetime_games });
  if (primetime_games.length) {
    console.log({ "primetime_games[0]": primetime_games[0] });
    primetime_games.forEach((g) => (g.is_primetime_game = true));
    primetime_games[0].is_game_of_the_week = true;
  }

  db.game.update(games);
  await db.saveDatabaseAsync();

};

const calculate_national_rankings = async (this_week, all_weeks, common) => {
  const db = common.db;

  let ls = db.league_season.findOne({ season: common.season });
  let teams = db.team.find();
  let team_seasons = db.team_season.find({ season: common.season, team_id: { $gt: 0 } });
  let team_season_ids = team_seasons.map((ts) => ts.team_season_id);

  let conferences = db.conference.find();
  let conferences_by_conference_id = index_group_sync(conferences, "index", "conference_id");

  let conference_seasons = db.conference_season.find({ season: common.season });
  conference_seasons = nest_children(
    conference_seasons,
    conferences_by_conference_id,
    "conference_id",
    "conference"
  );
  let conference_seasons_by_conference_season_id = index_group_sync(
    conference_seasons,
    "index",
    "conference_season_id"
  );

  team_seasons = nest_children(
    team_seasons,
    conference_seasons_by_conference_season_id,
    "conference_season_id",
    "conference_season"
  );

  let weeks = db.week.find({ season: { $between: [common.season - 1, common.season + 1] } });
  let weeks_by_week_id = index_group_sync(weeks, "index", "week_id");
  let current_week = weeks.find((w) => w.is_current);

  console.log({ weeks: weeks, current_week: current_week });

  let team_season_stats = db.team_season_stats.find({ team_season_id: { $in: team_season_ids } });
  const team_season_stats_by_team_season_id = index_group_sync(
    team_season_stats,
    "index",
    "team_season_id"
  );
  team_seasons = nest_children(
    team_seasons,
    team_season_stats_by_team_season_id,
    "team_season_id",
    "stats"
  );

  let team_games = db.team_game.find({ team_season_id: { $in: team_season_ids } });
  let game_ids = team_games.map((tg) => tg.game_id);
  let games = db.game.find({ game_id: { $in: game_ids } });
  games = nest_children(games, weeks_by_week_id, "week_id", "week");

  let games_by_game_id = index_group_sync(games, "index", "game_id");

  team_games = nest_children(team_games, games_by_game_id, "game_id", "game");
  //team_games = team_games.filter((tg) => tg.game.was_played);
  // team_games = team_games.filter((tg) => (tg.game.week.schedule_week_number || 2000) <= 1999);
  let team_games_by_team_season_id = index_group_sync(team_games, "group", "team_season_id");

  let teams_by_team_id = index_group_sync(teams, "index", "team_id");
  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  team_seasons = nest_children(
    team_seasons,
    team_games_by_team_season_id,
    "team_season_id",
    "team_games"
  );
  team_seasons = team_seasons.filter((ts) => ts.team_id > 0);
  console.log({ team_seasons: team_seasons });

  let overall_power_modifier = 1;
  if (current_week.week_name == "Pre-Season") {
    overall_power_modifier = 5;
  }
  if (current_week.schedule_week_number) {
    overall_power_modifier = 3 - current_week.schedule_week_number * 0.15;
  }

  for (let ts of team_seasons) {
    ts.srs = {
      loops: 0,
      overall_rating: Math.ceil(
        ts.rating.overall ** overall_power_modifier / 99 ** (overall_power_modifier - 1)
      ),
      brand: Math.ceil(
        ts.team.team_ratings.brand ** overall_power_modifier / 20 ** (overall_power_modifier - 1)
      ),
      wins: 0,
      losses: 0,
      games_played: 0,
      fractional_wins: 0,
      fractional_losses: 0,
      fractional_games_played: 0,
    };

    ts.team_games = ts.team_games || [];

    ts.srs.all_team_season_ids = ts.team_games.map((tg) => tg.opponent_team_season_id);
    ts.srs.played_team_season_ids = ts.team_games
      .filter((tg) => tg.game.was_played)
      .map((tg) => tg.opponent_team_season_id);
    ts.srs.unplayed_team_season_ids = ts.team_games
      .filter((tg) => !tg.game.was_played)
      .map((tg) => tg.opponent_team_season_id);

    ts.played_team_games = ts.team_games
      .filter((tg) => tg.game.was_played)
      .sort((tg_a, tg_b) => tg_a.game.week_id - tg_b.game.week_id);
    ts.srs.games_played = ts.played_team_games.length;

    let game_index = 0;
    for (let tg of ts.played_team_games) {
      ts.srs.wins += tg.is_winning_team ? 1 : 0;
      ts.srs.losses += tg.is_winning_team ? 0 : 1;

      tg.game_fractional_share = (1.0 / (ts.srs.games_played - game_index)) ** 0.2;

      ts.srs.fractional_wins += (tg.is_winning_team ? 1.0 : 0) * tg.game_fractional_share;
      ts.srs.fractional_losses += (tg.is_winning_team ? 0 : 1.0) * tg.game_fractional_share;

      ts.srs.fractional_games_played += tg.game_fractional_share;
      game_index += 1;
    }
    ts.srs.net_win_count = ts.srs.wins - ts.srs.losses;
    ts.srs.fractional_net_win_count = ts.srs.fractional_wins - ts.srs.fractional_losses;
    ts.srs.rating = ts.srs.overall_rating + ts.srs.brand + ts.srs.fractional_net_win_count;
    ts.srs.original_rating = ts.srs.rating;
    ts.srs.rating_list = [ts.srs.rating];
  }

  let overall_list = team_seasons.map((ts) => ts.srs.rating);
  let average_overall = Math.ceil(average(overall_list));

  let team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  console.log({
    team_seasons: team_seasons,
    average_overall: average_overall,
    overall_list: overall_list,
  });

  for (let iter_ind = 1; iter_ind <= 3; iter_ind++) {
    for (let ts of Object.values(team_seasons_by_team_season_id)) {
      let total_opponent_rating = 0;
      let fractional_opponent_rating = 0;
      for (let tg of ts.played_team_games) {
        total_opponent_rating +=
          team_seasons_by_team_season_id[tg.opponent_team_season_id].srs.rating;
        fractional_opponent_rating +=
          team_seasons_by_team_season_id[tg.opponent_team_season_id].srs.rating *
          tg.game_fractional_share;
      }
      ts.srs.schedule_factor = Math.round(
        (fractional_opponent_rating + ts.srs.fractional_net_win_count * average_overall) /
          (ts.srs.fractional_games_played || 1)
      );
    }

    for (let ts of Object.values(team_seasons_by_team_season_id)) {
      // ts.srs.rating = (ts.srs.original_rating + ts.srs.schedule_factor) / 2;
      ts.srs.rating = (ts.srs.rating * iter_ind + ts.srs.schedule_factor) / (iter_ind + 1);
      ts.srs.rating_list.unshift(ts.srs.rating);
    }
  }

  for (let [team_season_id, ts] of Object.entries(team_seasons_by_team_season_id)) {
    // ts.srs.rating = Math.round(((ts.srs.rating * 1) + ((ts.rankings.srs_ratings[0] || ts.srs.rating) * 1)) / 2);
    if (ts.srs.games_played <= 2) {
      ts.srs.rating *= ts.srs.games_played;
      ts.srs.rating += (2 - ts.srs.games_played) * ts.srs.original_rating;
      ts.srs.rating /= 2;
    }
    ts.srs.rating = Math.round(
      (ts.srs.rating * 9 + (ts.rankings.srs_ratings[0] || ts.srs.rating) * 1) / 10
    );
  }

  for (let [team_season_id, ts] of Object.entries(team_seasons_by_team_season_id)) {
    ts.srs.sos = ts.srs.sos || {};
    let count = 0;
    let summed_srs = 0;
    for (let opponent_team_season_id of ts.srs.all_team_season_ids) {
      summed_srs += team_seasons_by_team_season_id[opponent_team_season_id].srs.rating;
      count += 1;
    }

    if (count) {
      ts.srs.sos.sos_all_opponents = summed_srs / count;
    } else {
      ts.srs.sos.all_opponents = 0;
    }

    count = 0;
    summed_srs = 0;
    for (let opponent_team_season_id of ts.srs.played_team_season_ids) {
      summed_srs += team_seasons_by_team_season_id[opponent_team_season_id].srs.rating;
      count += 1;
    }

    if (count) {
      ts.srs.sos.sos_played_opponents = summed_srs / count;
    } else {
      ts.srs.sos.played_opponents = 0;
    }

    count = 0;
    summed_srs = 0;
    for (let opponent_team_season_id of ts.srs.unplayed_team_season_ids) {
      summed_srs += team_seasons_by_team_season_id[opponent_team_season_id].srs.rating;
      count += 1;
    }

    if (count) {
      ts.srs.sos.sos_unplayed_opponents = (summed_srs * 1.0) / count;
    } else {
      ts.srs.sos.unplayed_opponents = 0;
    }

    console.log({
      summed_srs: summed_srs,
      count: count,
      "ts.srs.unplayed_team_season_ids": ts.srs.unplayed_team_season_ids,
      "ts.srs.sos.sos_unplayed_opponents": ts.srs.sos.sos_unplayed_opponents,
      ts: ts,
    });
  }

  console.log({ team_seasons_by_team_season_id: team_seasons_by_team_season_id });

  team_seasons = team_seasons.sort(function (ts_a, ts_b) {
    if (ts_a.srs.rating < ts_b.srs.rating) return 1;
    if (ts_a.srs.rating > ts_b.srs.rating) return -1;
    return 0;
  });

  // for (let [team_season_id, ts] of Object.entries(team_seasons_by_team_season_id)) {
  //   ts.srs.rating = Math.round((ts.srs.rating + ((ts.rankings.srs_ratings[0] || ts.srs.rating) * 1)) / 2);
  // }

  console.log({
    ls: ls,
    team_seasons: team_seasons,
  });

  let sorted_team_seasons = team_seasons.sort(function (ts_a, ts_b) {
    if (ts_a.results.national_champion) return -1;
    if (ts_b.results.national_champion) return 1;

    if (ls.playoffs.playoffs_started && !ls.playoffs.playoffs_complete) {
      if ((ts_a.playoff.seed || 200) < (ts_b.playoff.seed || 200)) return -1;
      if ((ts_a.playoff.seed || 200) > (ts_b.playoff.seed || 200)) return 1;
    }

    if (ts_a.srs.rating < ts_b.srs.rating) return 1;
    if (ts_a.srs.rating > ts_b.srs.rating) return -1;

    if (
      ts_a.record.defeated_teams.includes(ts_b.team_season_id) &&
      !ts_b.record.defeated_teams.includes(ts_a.team_season_id)
    )
      return -1;
    if (ts_b.record.defeated_teams.includes(ts_a.team_season_id)) return 1;

    if (ts_a.record.losses < ts_b.record.losses) return -1;
    if (ts_a.record.losses > ts_b.record.losses) return 1;

    if (ts_a.record.net_wins > ts_b.record.net_wins) return -1;
    if (ts_a.record.net_wins < ts_b.record.net_wins) return 1;

    if (ts_a.team.team_ratings.program_history > ts_b.team.team_ratings.program_history) return -1;
    if (ts_b.team.team_ratings.program_history < ts_a.team.team_ratings.program_history) return 1;

    return 0;
  });

  let rank_counter = 1;

  for (var team_season of sorted_team_seasons) {
    team_season.rankings.national_rank.unshift(rank_counter);
    team_season.rankings.srs_ratings.unshift(team_season.srs.rating);
    team_season.rankings.sos = team_season.rankings.sos || {
      all_opponents_sos: [],
      played_opponents_sos: [],
      unplayed_opponents_sos: [],
      all_opponents_sos_ranking: [],
      played_opponents_sos_ranking: [],
      unplayed_opponents_sos_ranking: [],
    };
    team_season.rankings.sos.all_opponents_sos.unshift(team_season.srs.sos.sos_all_opponents);
    team_season.rankings.sos.played_opponents_sos.unshift(team_season.srs.sos.sos_played_opponents);
    team_season.rankings.sos.unplayed_opponents_sos.unshift(
      team_season.srs.sos.sos_unplayed_opponents
    );
    rank_counter += 1;

    if (team_season.rankings.national_rank.length > 1) {
      team_season.rankings.national_rank_delta =
        team_season.rankings.national_rank[1] - team_season.rankings.national_rank[0];
      team_season.rankings.national_rank_delta_abs = Math.abs(
        team_season.rankings.national_rank_delta
      );
    } else {
      team_season.rankings.national_rank_delta = 0;
      team_season.rankings.national_rank_delta_abs = 0;
    }
  }

  console.log({ sorted_team_seasons: sorted_team_seasons });
  sorted_team_seasons = sorted_team_seasons.sort(function (ts_a, ts_b) {
    return ts_b.stats.points_per_game - ts_a.stats.points_per_game;
  });
  rank_counter = 1;
  for (var team_season of sorted_team_seasons) {
    team_season.rankings.stat_rankings.offense.unshift(rank_counter);
    rank_counter += 1;
  }

  sorted_team_seasons = sorted_team_seasons.sort(function (ts_a, ts_b) {
    return ts_a.stats.points_allowed_per_game - ts_b.stats.points_allowed_per_game;
  });
  rank_counter = 1;
  for (var team_season of sorted_team_seasons) {
    team_season.rankings.stat_rankings.defense.unshift(rank_counter);
    rank_counter += 1;
  }

  sorted_team_seasons = sorted_team_seasons.sort(function (ts_a, ts_b) {
    return ts_b.stats.point_differential_per_game - ts_a.stats.point_differential_per_game;
  });
  rank_counter = 1;
  for (var team_season of sorted_team_seasons) {
    team_season.rankings.stat_rankings.overall.unshift(rank_counter);
    rank_counter += 1;
  }

  //ALL SOS
  sorted_team_seasons = sorted_team_seasons.sort(function (ts_a, ts_b) {
    return ts_b.rankings.sos.all_opponents_sos[0] - ts_a.rankings.sos.all_opponents_sos[0];
  });
  rank_counter = 1;
  for (var team_season of sorted_team_seasons) {
    team_season.rankings.sos.all_opponents_sos_ranking.unshift(rank_counter);
    rank_counter += 1;
  }

  //PLAYED SOS
  sorted_team_seasons = sorted_team_seasons.sort(function (ts_a, ts_b) {
    return ts_b.rankings.sos.played_opponents_sos[0] - ts_a.rankings.sos.played_opponents_sos[0];
  });
  rank_counter = 1;
  for (var team_season of sorted_team_seasons) {
    team_season.rankings.sos.played_opponents_sos_ranking.unshift(rank_counter);
    rank_counter += 1;
  }

  //UNPLAYED SOS
  sorted_team_seasons = sorted_team_seasons.sort(function (ts_a, ts_b) {
    return (
      ts_b.rankings.sos.unplayed_opponents_sos[0] - ts_a.rankings.sos.unplayed_opponents_sos[0]
    );
  });
  rank_counter = 1;
  for (var team_season of sorted_team_seasons) {
    team_season.rankings.sos.unplayed_opponents_sos_ranking.unshift(rank_counter);
    rank_counter += 1;
  }

  let headline_id = db.headline.nextId("headline_id");
  let ranking_headlines = await generate_ranking_headlines(
    common,
    sorted_team_seasons,
    current_week,
    headline_id
  );

  console.log({ sorted_team_seasons: sorted_team_seasons, ranking_headlines: ranking_headlines });
  for (team_season of sorted_team_seasons) {
    delete team_season.team;
    delete team_season.season_stats;
    delete team_season.team_games;
    delete team_season.srs;
    delete team_season.conference_season;
  }

  db.team_season.update(sorted_team_seasons);
  db.headline.insert(ranking_headlines);

  await db.saveDatabaseAsync();

};

const calculate_conference_rankings = async (this_week, all_weeks, common) => {
  const db = await common.db;
  const all_weeks_by_week_id = index_group_sync(all_weeks, "index", "week_id");

  all_weeks_by_week_id[this_week.week_id + 1];
  const conference_seasons = db.conference_season.find({ season: common.season });

  const team_seasons = db.team_season.find({ season: this_week.phase.season, team_id: { $gt: 0 } });

  const team_seasons_by_conference_season_id = index_group_sync(
    team_seasons,
    "group",
    "conference_season_id"
  );

  var rank_counter = 0,
    sorted_team_seasons = [],
    team_seasons_to_save = [];

  for (var conference_season of conference_seasons) {
    var conference_team_seasons =
      team_seasons_by_conference_season_id[conference_season.conference_season_id];

    console.log({
      conference_seasons: conference_seasons,
      conference_season: conference_season,
      team_seasons_by_conference_season_id: team_seasons_by_conference_season_id,
    });

    for (let division of conference_season.divisions) {
      let division_team_seasons = conference_team_seasons.filter(
        (ts) => ts.division_name == division.division_name
      );

      sorted_team_seasons = division_team_seasons.sort(function (a, b) {
        if (a.results.conference_champion) return -1;
        if (b.results.conference_champion) return 1;

        if (a.record.conference_net_wins > b.record.conference_net_wins) return -1;
        if (a.record.conference_net_wins < b.record.conference_net_wins) return 1;

        if (a.record.defeated_teams.includes(b.team_season_id)) return -1;
        if (b.record.defeated_teams.includes(a.team_season_id)) return 1;

        if (a.record.conference_losses > b.record.conference_losses) return 1;
        if (a.record.conference_losses < b.record.conference_losses) return -1;

        if (a.rankings.national_rank[0] > b.rankings.national_rank[0]) return 1;
        if (a.rankings.national_rank[0] < b.rankings.national_rank[0]) return -1;

        return 0;
      });

      rank_counter = 1;
      let top_conference_net_wins = sorted_team_seasons[0].record.conference_net_wins;
      for (var team_season of sorted_team_seasons) {
        team_season.record.conference_gb =
          (top_conference_net_wins - team_season.record.conference_net_wins) / 2;
        team_season.rankings.division_rank.unshift(rank_counter);
        rank_counter += 1;

        team_seasons_to_save.push(team_season);
      }
    }
  }

  db.team_season.update(team_seasons_to_save);
  await db.saveDatabaseAsync();

};

const weekly_recruiting = async (common) => {
  var startTime = performance.now();

  const db = common.db;
  const season = common.season;
  const this_week = db.week
    .findOne({ season: season, is_current: true });

  console.log({ this_week: this_week, season: season, db: db });

  var this_week_id = this_week.week_id;

  const teams = db.team.find({"team_id": {$gt: 0}});
  var team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });

  const team_season_ids = team_seasons.map((ts) => ts.team_season_id);
  const team_season_recruitings = db.team_season_recruiting.find({team_season_id: {team_season_ids}});
  const team_season_recruitings_by_team_season_id = index_group_sync(
    team_season_recruitings,
    "index",
    "team_season_id"
  );

  var teams_by_team_id = index_group_sync(teams, "index", "team_id");

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  team_seasons = nest_children(
    team_seasons,
    team_season_recruitings_by_team_season_id,
    "team_season_id",
    "recruiting"
  );

  team_seasons = team_seasons.sort(
    (ts_a, ts_b) => ts_b.team.team_ratings.brand - ts_a.team.team_ratings.brand
  );

  for (const team_season of team_seasons) {
    if (!("weeks" in team_season.recruiting)) {
      team_season.recruiting.weeks = {};
    }
    team_season.recruiting.weeks[this_week_id] = [];
  }

  var player_team_seasons = db.player_team_season
    .find({ season: season, team_season_id: {$lt: -1} });
  const player_team_season_ids = player_team_seasons.map((pts) => pts.player_team_season_id);
  const player_team_season_recruitings = db.player_team_season_recruiting.find(
    {player_team_season_id: {$in:player_team_season_ids}}
  );
  const player_team_season_recruitings_by_player_team_season_id = index_group_sync(
    player_team_season_recruitings,
    "index",
    "player_team_season_id"
  );

  var player_ids = player_team_seasons.map((pts) => pts.player_id);
  var players = db.player.find({"player_id": {$in: player_ids}});
  var players_by_player_id = index_group_sync(players, "index", "player_id");

  player_team_seasons = nest_children(
    player_team_seasons,
    player_team_season_recruitings_by_player_team_season_id,
    "player_team_season_id",
    "recruiting"
  );
  player_team_seasons = nest_children(
    player_team_seasons,
    players_by_player_id,
    "player_id",
    "player"
  );
  player_team_seasons = player_team_seasons.filter((pts) => !(pts.recruiting.signed == true));

  var player_tracker = {};

  for (const player_team_season of player_team_seasons) {
    if (!("weeks" in player_team_season.recruiting)) {
      player_team_season.recruiting.weeks = {};
    }
    player_team_season.recruiting.weeks[this_week_id] = [];
    player_tracker[player_team_season.player_team_season_id] = {
      recruit_calls_remaining: [6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1],
    };
  }

  var player_team_seasons_by_player_team_season_id = index_group_sync(
    player_team_seasons,
    "index",
    "player_team_season_id"
  );

  console.log({
    team_seasons: team_seasons,
    player_tracker: player_tracker,
    player_team_seasons: player_team_seasons,
  });

  var team_season_calls_tracker = {};
  var team_seasons_call_order_prep = [];
  var team_seasons_call_order = [];

  for (const team_season of team_seasons) {
    var team_season_id = team_season.team_season_id;
    var prep_obj = {
      team_season_id: team_season_id,
      order_tracker: [],
      brand_odds: team_season.team.team_ratings.brand ** 3,
    };
    prep_obj.recruit_calls_remaining = Math.ceil(team_season.team.team_ratings.brand + 20);

    var players_to_call = Object.values(team_season.recruiting.recruit_team_seasons);
    players_to_call = players_to_call.sort(
      (rts_a, rts_b) => rts_b.team_top_level_interest - rts_a.team_top_level_interest
    );
    team_season_calls_tracker[team_season_id] = {
      called_players: [],
      time_remaining: 60,
      players_to_call: players_to_call,
    };
    team_seasons_call_order_prep.push(prep_obj);
  }

  var teams_waiting_to_call = team_seasons_call_order_prep.filter(
    (t_o) => t_o.recruit_calls_remaining > 0
  ).length;
  var loop_count = 0;
  while (teams_waiting_to_call > 0) {
    var team_list = team_seasons_call_order_prep
      .filter((t_o) => t_o.recruit_calls_remaining > 0)
      .map((t_o) => [t_o.team_season_id, t_o.brand_odds + t_o.recruit_calls_remaining]);
    var chosen_team_season_id = weighted_random_choice(team_list);
    var chosen_team_obj = team_seasons_call_order_prep.find(
      (t_o) => t_o.team_season_id == chosen_team_season_id
    );

    chosen_team_obj.order_tracker.push(loop_count);
    loop_count += 1;

    chosen_team_obj.recruit_calls_remaining -= 1;
    team_seasons_call_order.push(parseInt(chosen_team_season_id));

    teams_waiting_to_call = team_seasons_call_order_prep.filter(
      (t_o) => t_o.recruit_calls_remaining > 0
    ).length;
  }

  var team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  console.log({
    team_season_calls_tracker: team_season_calls_tracker,
    player_tracker: player_tracker,
    teams_waiting_to_call: teams_waiting_to_call,
    team_seasons_call_order: team_seasons_call_order,
    team_seasons_call_order_prep: team_seasons_call_order_prep,
  });

  for (const team_season_id of team_seasons_call_order) {
    var team_season_tracker = team_season_calls_tracker[team_season_id];
    var team_season = team_seasons_by_team_season_id[team_season_id];
    var recruit_team_seasons_for_team = team_season_tracker.players_to_call;

    var time_remaining = team_season_tracker.time_remaining;

    // console.log({team_season_id:team_season_id, recruit_team_seasons_for_team:recruit_team_seasons_for_team, team_season:team_season, team_season_tracker:team_season_tracker, time_remaining:time_remaining})

    var loop_count = 0;
    var waiting_for_player = true;
    while (waiting_for_player) {
      if (time_remaining == 0 || recruit_team_seasons_for_team.length == 0) {
        waiting_for_player = false;
        continue;
      }

      var potential_player = recruit_team_seasons_for_team.shift();
      console.log({
        potential_player: potential_player,
        time_remaining: time_remaining,
        team_season: team_season,
        recruit_team_seasons_for_team: recruit_team_seasons_for_team,
        player_tracker: player_tracker,
        "player_tracker[potential_player.player_team_season_id]":
          player_tracker[potential_player.player_team_season_id],
      });
      if (
        potential_player == undefined ||
        !(potential_player.player_team_season_id in player_tracker)
      ) {
        waiting_for_player = true;
      } else if (
        player_tracker[potential_player.player_team_season_id].recruit_calls_remaining.length > 0
      ) {
        waiting_for_player = false;
        //calls player

        var call_time =
          player_tracker[potential_player.player_team_season_id].recruit_calls_remaining.shift();

        call_time = Math.min(call_time, time_remaining);

        team_season_tracker.time_remaining = team_season_tracker.time_remaining - call_time;

        // console.log({team_season_id:team_season_id, 'team_season_tracker.time_remaining ': team_season_tracker.time_remaining ,call_time:call_time,  player_tracker:player_tracker, 'player_tracker[potential_player.player_team_season_id]': player_tracker[potential_player.player_team_season_id]})

        //TODO - make this smarter. base off if team knows or not
        var sorted_call_topics = Object.values(potential_player.match_ratings).sort(
          (mv_a, mv_b) => mv_b.team - mv_a.team
        );

        var added_match_rating = 0;
        var added_team_top_level_interest = 0;
        for (const call_topic of sorted_call_topics.slice(0, call_time)) {
          added_match_rating += recruiting_pitch_value(
            player_team_seasons_by_player_team_season_id[potential_player.player_team_season_id]
              .recruiting.interests[call_topic.topic],
            call_topic.team
          );
          console.log({
            "player_team_seasons_by_player_team_season_id[potential_player.player_team_season_id]":
              player_team_seasons_by_player_team_season_id[potential_player.player_team_season_id],
            call_topic: call_topic,
            added_match_rating: added_match_rating,
            "call_topic.player": call_topic.player,
            "call_topic.team": call_topic.team,
          });
          added_team_top_level_interest += 1;
        }

        console.log({
          added_team_top_level_interest: added_team_top_level_interest,
          added_team_top_level_interest: added_team_top_level_interest,
        });

        player_team_seasons_by_player_team_season_id[
          potential_player.player_team_season_id
        ].recruiting.recruit_team_seasons[potential_player.team_season_id].match_rating +=
          added_match_rating;
        team_seasons_by_team_season_id[
          potential_player.team_season_id
        ].recruiting.recruit_team_seasons[
          potential_player.player_team_season_id
        ].team_top_level_interest += added_team_top_level_interest;

        player_team_seasons_by_player_team_season_id[
          potential_player.player_team_season_id
        ].recruiting.weeks[this_week_id].push({
          team_season_id: potential_player.team_season_id,
          call_time: call_time,
          added_match_rating: added_match_rating,
        });
        team_seasons_by_team_season_id[potential_player.team_season_id].recruiting.weeks[
          this_week_id
        ].push({
          player_team_season_id: potential_player.player_team_season_id,
          team_season_id: potential_player.team_season_id,
          call_time: call_time,
          added_match_rating: added_match_rating,
        });
      }

      loop_count += 1;
    }
  }

  // console.log({recruit_team_seasons_by_recruit_team_season_id:recruit_team_seasons_by_recruit_team_season_id, all_recruit_team_seasons:all_recruit_team_seasons, recruit_team_seasons_by_player_team_season_id:recruit_team_seasons_by_player_team_season_id})
  //GROUP RTSs BY PLAYER

  for (const player_team_season_id in player_team_seasons_by_player_team_season_id) {
    var player_team_season = player_team_seasons_by_player_team_season_id[player_team_season_id];
    var recruit_team_seasons = Object.values(player_team_season.recruiting.recruit_team_seasons);
    console.log({
      recruit_team_seasons: recruit_team_seasons,
      player_team_season: player_team_season,
      player_team_season_id: player_team_season_id,
      player_team_seasons_by_player_team_season_id: player_team_seasons_by_player_team_season_id,
    });
    recruit_team_seasons = recruit_team_seasons.sort(
      (rts_a, rts_b) => rts_b.match_rating - rts_a.match_rating
    );

    var cutoff = 1;
    if (this_week.week_name == "Early Signing Day" && recruit_team_seasons[0].match_rating > 100) {
      cutoff = recruit_team_seasons[0].match_rating * 0.99;
    } else if (recruit_team_seasons[0].match_rating > 1750) {
      cutoff = recruit_team_seasons[0].match_rating * 0.95;
    } else if (recruit_team_seasons[0].match_rating > 2000) {
      cutoff = recruit_team_seasons[0].match_rating * 0.85;
    } else if (recruit_team_seasons[0].match_rating > 1500) {
      cutoff = recruit_team_seasons[0].match_rating * 0.66;
    } else if (recruit_team_seasons[0].match_rating > 1000) {
      cutoff = recruit_team_seasons[0].match_rating * 0.5;
    } else if (recruit_team_seasons[0].match_rating > 300 && this_week.schedule_week_number >= 12) {
      cutoff = recruit_team_seasons[0].match_rating * 0.75;
    } else if (recruit_team_seasons[0].match_rating > 500 && this_week.schedule_week_number >= 10) {
      cutoff = recruit_team_seasons[0].match_rating * 0.5;
    }

    var recruit_team_seasons_below_cutoff = recruit_team_seasons.filter(
      (rts) => rts.match_rating < cutoff
    );
    recruit_team_seasons.filter(
      (rts) => rts.match_rating >= cutoff
    );

    if (
      recruit_team_seasons[1].match_rating < cutoff &&
      (recruit_team_seasons[0].match_rating > 300 ||
        (recruit_team_seasons[0].match_rating > 100 && this_week.schedule_week_number >= 12))
    ) {
      var signed_recruit_team_season = recruit_team_seasons[0];
      var signed_team_season =
        team_seasons_by_team_season_id[signed_recruit_team_season.team_season_id];

      if (signed_team_season.recruiting.scholarships_to_offer > 0) {
        player_team_season.recruiting.signed = true;
        player_team_season.recruiting.signed_team_season_id =
          signed_recruit_team_season.team_season_id;
        player_team_season.recruiting.stage = "Signed";

        var player_stars = player_team_season.recruiting.stars;

        signed_team_season.recruiting.scholarships_to_offer -= 1;

        signed_team_season.recruiting.signed_player_stars["stars_" + player_stars] += 1;

        for (const team_season_id of recruit_team_seasons_below_cutoff) {
          team_seasons_by_team_season_id[
            signed_recruit_team_season.team_season_id
          ].recruiting.recruit_team_seasons[player_team_season_id].team_top_level_interest = -1;
        }
      } else {
        signed_team_season.recruiting.recruit_team_seasons[
          player_team_season_id
        ].team_top_level_interest = 0;
      }
    } else {
      //TODO fix this
      console.log("something here");
      // for (const recruit_team_season of recruit_team_seasons_below_cutoff){
      // 	recruit_team_season.team_top_level_interest = recruit_team_season.team_top_level_interest / 2;
      // 	updated_recruit_team_seasons.push(recruit_team_season);
      // }
      // for (const recruit_team_season of recruit_team_seasons_above_cutoff){
      // 	recruit_team_season.team_top_level_interest += parseInt(recruit_team_seasons_below_cutoff.length / 10);
      // 	updated_recruit_team_seasons.push(recruit_team_season);
      // }
    }
  }

  var team_seasons = Object.values(team_seasons_by_team_season_id);

  team_seasons = team_seasons.map(function (ts) {
    ts.recruiting.signed_player_stars["total"] =
      ts.recruiting.signed_player_stars["stars_5"] +
      ts.recruiting.signed_player_stars["stars_4"] +
      ts.recruiting.signed_player_stars["stars_3"] +
      ts.recruiting.signed_player_stars["stars_2"] +
      ts.recruiting.signed_player_stars["stars_1"];
    ts.recruiting.class_points =
      5 * ts.recruiting.signed_player_stars["stars_5"] +
      4 * ts.recruiting.signed_player_stars["stars_4"] +
      3 * ts.recruiting.signed_player_stars["stars_3"] +
      2 * ts.recruiting.signed_player_stars["stars_2"] +
      1 * ts.recruiting.signed_player_stars["stars_1"];
    return ts;
  });

  team_seasons = team_seasons.sort(
    (ts_a, ts_b) => ts_b.recruiting.class_points - ts_a.recruiting.class_points
  );

  var loop_count = 1;
  for (const team_season of team_seasons) {
    team_season.recruiting.recruiting_class_rank = loop_count;
    loop_count += 1;
  }

  player_team_seasons = Object.values(player_team_seasons_by_player_team_season_id);

  const player_team_season_recruitings_to_put = player_team_seasons.map((pts) => pts.recruiting);
  player_team_seasons.forEach((pts) => delete pts.recruiting);
  player_team_seasons.forEach((pts) => delete pts.player);

  const team_season_recruitings_to_put = team_seasons.map((ts) => ts.recruiting);
  for (team_season of team_seasons) {
    delete team_season.team;
    delete team_season.stats;
    delete team_season.team_games;
    delete team_season.recruiting;
  }

  console.log({
    team_season_recruitings_to_put: team_season_recruitings_to_put,
  });

  await Promise.all([
    db.player_team_season.update(player_team_seasons),
    db.player_team_season_recruiting.update(player_team_season_recruitings_to_put),
    db.team_season.update(team_seasons),
    db.team_season_recruiting.update(team_season_recruitings_to_put),
  ]);

  await db.saveDatabaseAsync();


  console.log("Done putting on 5789");

  var endTime = performance.now();
  console.log(`Time taken to do weekly recruiting: ${parseInt(endTime - startTime)} ms`);
};

const choose_players_of_the_week = async (this_week, common) => {
  const db = common.db;

  const games = db.game.find({ week_id: this_week.week_id });
  const game_ids = games.map((g) => g.game_id);
  const games_by_game_id = index_group_sync(games, "index", "game_id");

  var team_games = db.team_game.find({ game_id: { $in: game_ids } });
  const team_game_ids = team_games.map((tg) => tg.team_game_id);
  team_games = nest_children(team_games, games_by_game_id, "game_id", "game");
  const team_games_by_team_game_id = index_group_sync(team_games, "index", "team_game_id");

  var player_team_games = db.player_team_game.find({ team_game_id: { $in: team_game_ids } });

  const player_team_season_ids = player_team_games.map((ptg) => ptg.player_team_season_id);
  var player_team_seasons = db.player_team_season.find({
    player_team_season_id: { $in: player_team_season_ids },
  });

  player_team_seasons = player_team_seasons.map(function (pts) {
    pts.position_group = position_group_map[pts.position];
    return pts;
  });

  const player_ids = player_team_seasons.map((pts) => pts.player_id);
  var players = db.player.find({ player_id: { $in: player_ids } });
  console.log({
    players: players,
    player_ids: player_ids,
    player_team_seasons: player_team_seasons,
    player_team_season_ids: player_team_season_ids,
    player_team_games: player_team_games,
  });
  const players_by_player_id = index_group_sync(players, "index", "player_id");

  const team_season_ids = player_team_seasons.map((pts) => pts.team_season_id);
  var team_seasons = db.team_season.find({ team_season_id: { $in: team_season_ids } });

  const team_ids = team_seasons.map((ts) => ts.team_id);
  var teams = db.team.find({ team_id: { $in: team_ids } });
  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  const team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

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

  const player_team_seasons_by_player_team_season_id = index_group_sync(
    player_team_seasons,
    "index",
    "player_team_season_id"
  );
  player_team_games = nest_children(
    player_team_games,
    player_team_seasons_by_player_team_season_id,
    "player_team_season_id",
    "player_team_season"
  );

  player_team_games = player_team_games.filter(
    (ptg) => ptg.game_stats.games.weighted_game_score > 0
  );
  player_team_games = player_team_games.sort(
    (ptg_a, ptg_b) =>
      ptg_b.game_stats.games.weighted_game_score - ptg_a.game_stats.games.weighted_game_score
  );
  player_team_games = nest_children(
    player_team_games,
    team_games_by_team_game_id,
    "team_game_id",
    "team_game"
  );

  console.log({ player_team_games: player_team_games });
  player_team_games.map((ptg) =>
    get(ptg, "player_team_season.team_season.conference_season_id")
  );

  const player_team_games_by_conference_season_id = index_group_sync(
    player_team_games,
    "group",
    "player_team_season.team_season.conference_season_id"
  );
  var player_team_games_by_position_group = index_group_sync(
    player_team_games,
    "group",
    "player_team_season.position_group"
  );

  var awards_to_save = [];

  let award_id = db.award.nextId("award_id");

  for (const position_group in player_team_games_by_position_group) {
    var position_group_player_team_games = player_team_games_by_position_group[position_group];
    var ptg = position_group_player_team_games[0];
    var a = new award(
      award_id,
      ptg.player_team_season_id,
      ptg.player_team_game_id,
      this_week.week_id,
      this_week.season,
      "position_group",
      position_group,
      "national",
      "week",
      null
    );
    awards_to_save.push(a);
    award_id += 1;
  }

  for (const conference_season_id in player_team_games_by_conference_season_id) {
    player_team_games = player_team_games_by_conference_season_id[conference_season_id];

    var player_team_games_by_position_group = index_group_sync(
      player_team_games,
      "group",
      "player_team_season.position_group"
    );

    for (const position_group in player_team_games_by_position_group) {
      position_group_player_team_games = player_team_games_by_position_group[position_group];
      var ptg = position_group_player_team_games[0];
      var a = new award(
        award_id,
        ptg.player_team_season_id,
        ptg.player_team_game_id,
        this_week.week_id,
        this_week.season,
        "position_group",
        position_group,
        "conference",
        "week",
        conference_season_id
      );
      awards_to_save.push(a);
      award_id += 1;
    }
  }

  db.award.insert(awards_to_save);

  await db.saveDatabaseAsync();

  console.log({
    player_team_games: player_team_games,
    player_team_games_by_conference_season_id: player_team_games_by_conference_season_id,
    player_team_games_by_position_group: player_team_games_by_position_group,
  });
};

const close_out_season = async (this_week, common) => {
  const db = common.db;

  const league_season = db.league_season.findOne(this_week.season);

  league_season.is_season_complete = true;

  db.league_season.update(league_season);

  await db.saveDatabaseAsync();

};

const choose_preseason_all_americans = async (common) => {
  const db = common.db;
  const all_weeks = db.week.find();
  const this_week = all_weeks.filter((w) => w.is_current)[0];
  console.log({ this_week: this_week });

  const position_count_map = {
    QB: 1,
    RB: 2,
    FB: 0,
    WR: 3,
    TE: 1,
    OT: 2,
    IOL: 3,

    EDGE: 2,
    DL: 2,
    LB: 3,
    CB: 3,
    S: 2,

    K: 1,
    P: 1,
  };

  let team_seasons = db.team_season.find({ season: common.season });
  let previous_team_seasons = db.team_season.find({ season: common.season - 1 });

  let teams = db.team.find();
  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  previous_team_seasons = nest_children(previous_team_seasons, teams_by_team_id, "team_id", "team");

  let previous_team_seasons_by_team_season_id = index_group_sync(
    previous_team_seasons,
    "index",
    "team_season_id"
  );

  let player_team_seasons = db.player_team_season.find({
    season: common.season,
    team_season_id: { $gt: 0 },
  });
  let previous_player_team_seasons = db.player_team_season.find({
    season: common.season - 1,
    team_season_id: { $gt: 0 },
  });

  const player_ids = player_team_seasons.map((pts) => pts.player_id);
  let players = db.player.find({ player_id: { $in: player_ids } });
  const players_by_player_id = index_group_sync(players, "index", "player_id");

  let previous_player_team_season_ids = previous_player_team_seasons.map(
    (pts) => pts.player_team_season_id
  );
  const previous_player_team_season_stats = db.player_team_season_stats.find({
    player_team_season_id: { $in: previous_player_team_season_ids },
  });

  let previous_player_team_season_stats_by_player_team_season_id = index_group_sync(
    previous_player_team_season_stats,
    "index",
    "player_team_season_id"
  );
  previous_player_team_seasons = nest_children(
    previous_player_team_seasons,
    previous_player_team_season_stats_by_player_team_season_id,
    "player_team_season_id",
    "season_stats"
  );
  previous_player_team_seasons = nest_children(
    previous_player_team_seasons,
    previous_team_seasons_by_team_season_id,
    "team_season_id",
    "team_season"
  );

  var previous_player_team_seasons_by_player_id = index_group_sync(
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
  //player_team_seasons = player_team_seasons.sort((pts_a, pts_b) => pts_b.games.weighted_game_score - pts_a.games.weighted_game_score)

  let award_id = db.award.nextId("award_id");

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  const team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

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

  player_team_seasons.map((pts) =>
    get(pts, "team_season.conference_season_id")
  );

  const player_team_seasons_by_conference_season_id = index_group_sync(
    player_team_seasons,
    "group",
    "team_season.conference_season_id"
  );
  var player_team_seasons_by_position = index_group_sync(player_team_seasons, "group", "position");

  let player_team_seasons_by_team_season_id = index_group_sync(
    player_team_seasons,
    "group",
    "team_season_id"
  );

  for (let [team_season_id, ts_player_team_seasons] of Object.entries(
    player_team_seasons_by_team_season_id
  )) {
    ts_player_team_seasons = ts_player_team_seasons.sort(
      (pts_a, pts_b) => pts_b.average_weighted_game_score - pts_a.average_weighted_game_score
    );
    ts_player_team_seasons.forEach(
      (pts, ind) => (pts.team_season_average_weighted_game_score_rank = ind + 1)
    );

    ts_player_team_seasons = ts_player_team_seasons.sort(
      (pts_a, pts_b) => pts_b.ratings.overall - pts_a.ratings.overall
    );
    ts_player_team_seasons.forEach((pts, ind) => (pts.team_season_overall_rank = ind + 1));
  }

  var awards_to_save = [];

  for (const position in player_team_seasons_by_position) {
    var position_player_team_seasons = player_team_seasons_by_position[position];
    position_player_team_seasons = position_player_team_seasons.sort(
      (pts_a, pts_b) => pts_b.ratings.overall.overall - pts_a.ratings.overall.overall
    );
    position_player_team_seasons = position_player_team_seasons.map((pts, ind) =>
      Object.assign(pts, { overall_rating_rank: ind })
    );

    position_player_team_seasons = position_player_team_seasons.sort(function (pts_a, pts_b) {
      if (
        pts_b.previous_player_team_season == undefined &&
        pts_a.previous_player_team_season == undefined
      ) {
        return 0;
      } else if (pts_b.previous_player_team_season == undefined) {
        return 100000 - pts_a.previous_player_team_season.player_award_rating;
      } else if (pts_a.previous_player_team_season == undefined) {
        return pts_b.previous_player_team_season.player_award_rating - 100000;
      }
      return (
        pts_b.previous_player_team_season.player_award_rating -
        pts_a.previous_player_team_season.player_award_rating
      );
    });
    position_player_team_seasons = position_player_team_seasons.map((pts, ind) =>
      Object.assign(pts, { previous_game_score_rank: ind })
    );

    position_player_team_seasons = position_player_team_seasons.map((pts, ind) =>
      Object.assign(pts, {
        award_rank: pts.overall_rating_rank + 3 * pts.previous_game_score_rank,
      })
    );

    position_player_team_seasons = position_player_team_seasons.sort(
      (pts_a, pts_b) => pts_a.award_rank - pts_b.award_rank
    );

    for (var i = 0; i < position_count_map[position]; i++) {
      let pts = position_player_team_seasons[i];
      var a = new award(
        award_id,
        pts.player_team_season_id,
        null,
        this_week.week_id,
        common.season,
        "position",
        position,
        "national",
        "pre-season",
        null,
        "First"
      );
      awards_to_save.push(a);
      award_id += 1;
    }
  }

  for (const conference_season_id in player_team_seasons_by_conference_season_id) {
    player_team_seasons = player_team_seasons_by_conference_season_id[conference_season_id];

    var player_team_seasons_by_position = index_group_sync(
      player_team_seasons,
      "group",
      "position"
    );

    for (const position in player_team_seasons_by_position) {
      var position_player_team_seasons = player_team_seasons_by_position[position];

      position_player_team_seasons = position_player_team_seasons.sort(
        (pts_a, pts_b) => pts_b.ratings.overall.overall - pts_a.ratings.overall.overall
      );
      position_player_team_seasons = position_player_team_seasons.map((pts, ind) =>
        Object.assign(pts, { overall_rating_rank: ind })
      );

      position_player_team_seasons = position_player_team_seasons.sort(function (pts_a, pts_b) {
        if (
          pts_b.previous_player_team_season == undefined &&
          pts_a.previous_player_team_season == undefined
        ) {
          return 0;
        } else if (pts_b.previous_player_team_season == undefined) {
          return 100000 - pts_a.previous_player_team_season.player_award_rating;
        } else if (pts_a.previous_player_team_season == undefined) {
          return pts_b.previous_player_team_season.player_award_rating - 100000;
        }
        return (
          pts_b.previous_player_team_season.player_award_rating -
          pts_a.previous_player_team_season.player_award_rating
        );
      });
      position_player_team_seasons = position_player_team_seasons.map((pts, ind) =>
        Object.assign(pts, { previous_game_score_rank: ind })
      );

      position_player_team_seasons = position_player_team_seasons.map((pts, ind) =>
        Object.assign(pts, {
          award_rank: pts.overall_rating_rank + 4 * pts.previous_game_score_rank,
        })
      );

      position_player_team_seasons = position_player_team_seasons.sort(
        (pts_a, pts_b) => pts_a.award_rank - pts_b.award_rank
      );

      for (var i = 0; i < position_count_map[position]; i++) {
        let pts = position_player_team_seasons[i];
        var a = new award(
          award_id,
          pts.player_team_season_id,
          null,
          this_week.week_id,
          common.season,
          "position",
          position,
          "conference",
          "pre-season",
          parseInt(conference_season_id),
          "First"
        );

        awards_to_save.push(a);
        award_id += 1;
      }
    }
  }

  db.award.insert(awards_to_save);
  await db.saveDatabaseAsync();

};

const choose_all_americans = async (this_week, common) => {
  const db = common.db;

  stopwatch(common, "Starting choose_all_americans");

  const position_count_map = {
    QB: 1,
    RB: 2,
    FB: 0,
    WR: 3,
    TE: 1,
    OT: 2,
    IOL: 3,

    EDGE: 2,
    DL: 2,
    LB: 3,
    CB: 3,
    S: 2,

    K: 1,
    P: 1,
  };

  var player_team_seasons = db.player_team_season.find({
    season: common.season,
    team_season_id: { $gt: 0 },
  });
  const player_team_season_ids = player_team_seasons.map((pts) => pts.player_team_season_id);
  const player_team_season_stats = db.player_team_season_stats.find({
    player_team_season_id: { $in: player_team_season_ids },
  });
  const player_team_season_stats_by_player_team_season_id = index_group_sync(
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
  //player_team_seasons = player_team_seasons.filter(pts => pts.season_stats.games.weighted_game_score > 0);
  stopwatch(common, "Fetched PTSs");

  const player_ids = player_team_seasons.map((pts) => pts.player_id);
  var players = db.player.find({ player_id: { $in: player_ids } });
  const players_by_player_id = index_group_sync(players, "index", "player_id");

  stopwatch(common, "Fetched Players");

  const team_season_ids = distinct(player_team_seasons.map((pts) => pts.team_season_id));
  var team_seasons = db.team_season.find({team_season_id:{$in:team_season_ids}});

  const team_ids = team_seasons.map((ts) => ts.team_id);
  var teams = db.team.find({ team_id: { $in: team_ids } });
  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  stopwatch(common, "Fetched TSs and Teams");

  let award_id = db.award.nextId("award_id");

  team_seasons = nest_children(team_seasons, teams_by_team_id, "team_id", "team");
  const team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

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

  let player_team_seasons_by_team_season_id = index_group_sync(
    player_team_seasons,
    "group",
    "team_season_id"
  );

  stopwatch(common, "Fetched Indexed data");

  for (let [team_season_id, ts_player_team_seasons] of Object.entries(
    player_team_seasons_by_team_season_id
  )) {
    ts_player_team_seasons = ts_player_team_seasons.sort(
      (pts_a, pts_b) => pts_b.average_weighted_game_score - pts_a.average_weighted_game_score
    );
    ts_player_team_seasons.forEach(
      (pts, ind) => (pts.team_season_average_weighted_game_score_rank = ind + 1)
    );
  }

  player_team_seasons = player_team_seasons.sort(
    (pts_a, pts_b) => pts_b.player_award_rating - pts_a.player_award_rating
  );
  console.log({ player_team_seasons: player_team_seasons });
  player_team_seasons.map((pts) =>
    get(pts, "team_season.conference_season_id")
  );

  const player_team_seasons_by_conference_season_id = index_group_sync(
    player_team_seasons,
    "group",
    "team_season.conference_season_id"
  );
  var player_team_seasons_by_position = index_group_sync(player_team_seasons, "group", "position");

  var awards_to_save = [];

  stopwatch(common, "Sorted data");

  const heisman_player_team_season = player_team_seasons[0];
  var a = new award(
    award_id,
    heisman_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Heisman",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  var r = Math.random();
  var maxwell_player_team_season_index = 0;
  if (r > 0.25) {
    maxwell_player_team_season_index = 0;
  } else if (r > 0.1) {
    maxwell_player_team_season_index = 2;
  } else {
    maxwell_player_team_season_index = 3;
  }
  const maxwell_player_team_season = player_team_seasons[maxwell_player_team_season_index];
  var a = new award(
    award_id,
    maxwell_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Maxwell",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  var r = Math.random();
  const camp_player_team_season_index = Math.floor(5 * r);
  const camp_player_team_season = player_team_seasons[camp_player_team_season_index];
  var a = new award(
    award_id,
    camp_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Camp",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const rimington_player_team_seasons = player_team_seasons.filter((pts) => pts.position == "IOL");
  const rimington_player_team_season = rimington_player_team_seasons[0];
  var a = new award(
    award_id,
    rimington_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Rimington",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const outland_player_team_seasons = player_team_seasons.filter(
    (pts) => pts.position == "IOL" || pts.position == "DL"
  );
  const outland_player_team_season = outland_player_team_seasons[0];
  var a = new award(
    award_id,
    outland_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Outland",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const thorpe_player_team_seasons = player_team_seasons.filter(
    (pts) => pts.position == "CB" || pts.position == "S"
  );
  const thorpe_player_team_season = thorpe_player_team_seasons[0];
  var a = new award(
    award_id,
    thorpe_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Thorpe",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  //TODO  - include punters
  // const guy_player_team_seasons = player_team_seasons.filter(pts => pts.position == 'P');
  // const guy_player_team_season = guy_player_team_seasons[0];
  // var a = new award(guy_player_team_season.player_team_season_id, null, this_week.week_id, this_week.season, 'individual', 'Ray Guy', 'national', 'regular season', null, 'National');
  // awards_to_save.push(a)

  const groza_player_team_seasons = player_team_seasons.filter((pts) => pts.position == "K");
  const groza_player_team_season = groza_player_team_seasons[0];
  var a = new award(
    award_id,
    groza_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Lou Groza",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const mackey_player_team_seasons = player_team_seasons.filter((pts) => pts.position == "TE");
  const mackey_player_team_season = mackey_player_team_seasons[0];
  var a = new award(
    award_id,
    mackey_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Mackey",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const biletnikoff_player_team_seasons = player_team_seasons.filter((pts) => pts.position == "WR");
  const biletnikoff_player_team_season = biletnikoff_player_team_seasons[0];
  var a = new award(
    award_id,
    biletnikoff_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Biletnikoff",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const walker_player_team_seasons = player_team_seasons.filter((pts) => pts.position == "RB");
  const walker_player_team_season = walker_player_team_seasons[0];
  var a = new award(
    award_id,
    walker_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Doak Walker",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const butkus_player_team_seasons = player_team_seasons.filter((pts) => pts.position == "LB");
  const butkus_player_team_season = butkus_player_team_seasons[0];
  var a = new award(
    award_id,
    butkus_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Butkus",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  const obrien_player_team_seasons = player_team_seasons.filter((pts) => pts.position == "QB");
  const obrien_player_team_season = obrien_player_team_seasons[0];
  var a = new award(
    award_id,
    obrien_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "O'Brien",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  var r = Math.random();
  const nagurski_player_team_seasons = player_team_seasons.filter(
    (pts) =>
      pts.position == "EDGE" ||
      pts.position == "DL" ||
      pts.position == "LB" ||
      pts.position == "CB" ||
      pts.position == "S"
  );
  const nagurski_player_team_season = nagurski_player_team_seasons[Math.floor(4 * r)];
  var a = new award(
    award_id,
    nagurski_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Nagurski",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  var r = Math.random();
  const bednarik_player_team_seasons = player_team_seasons.filter(
    (pts) =>
      pts.position == "EDGE" ||
      pts.position == "DL" ||
      pts.position == "LB" ||
      pts.position == "CB" ||
      pts.position == "S"
  );
  const bednarik_player_team_season = bednarik_player_team_seasons[Math.floor(4 * r)];
  var a = new award(
    award_id,
    bednarik_player_team_season.player_team_season_id,
    null,
    this_week.week_id,
    this_week.season,
    "individual",
    "Bednarik",
    "national",
    "regular season",
    null,
    "National"
  );
  awards_to_save.push(a);
  award_id += 1;

  stopwatch(common, "Top Individual awards chosen");

  //AWARDS TODO:
  //  Burlsworth Trophy - former walk-on
  //  Wuerffel Trophy  - high character
  //  Campbell Trophy  - academics + on-field
  //  Paul Hornung Award - Versatility
  // Patrick Mannelly Award - Long snapper
  // Jon Cornish Trophy - best canadian player

  //  George Munger Award - Coach of the year
  //  Broyles Award - best assistant coach

  for (const position in player_team_seasons_by_position) {
    var position_player_team_seasons = player_team_seasons_by_position[position];
    for (var i = 0; i < position_count_map[position]; i++) {
      let pts = position_player_team_seasons[i];
      var a = new award(
        award_id,
        pts.player_team_season_id,
        null,
        this_week.week_id,
        this_week.season,
        "position",
        position,
        "national",
        "regular season",
        null,
        "First"
      );
      awards_to_save.push(a);
      award_id += 1;
    }

    for (var i = position_count_map[position]; i < position_count_map[position] * 2; i++) {
      let pts = position_player_team_seasons[i];
      var a = new award(
        award_id,
        pts.player_team_season_id,
        null,
        this_week.week_id,
        this_week.season,
        "position",
        position,
        "national",
        "regular season",
        null,
        "Second"
      );
      awards_to_save.push(a);
      award_id += 1;
    }

    position_player_team_seasons = position_player_team_seasons.filter(
      (pts) => pts.class.class_name == "FR"
    );
    for (var i = 0; i < position_count_map[position]; i++) {
      let pts = position_player_team_seasons[i];
      if (pts) {
        var a = new award(
          award_id,
          pts.player_team_season_id,
          null,
          this_week.week_id,
          this_week.season,
          "position",
          position,
          "national",
          "regular season",
          null,
          "Freshman"
        );
        awards_to_save.push(a);
        award_id += 1;
      }
    }
  }

  stopwatch(common, "Position awards chosed");

  for (const conference_season_id in player_team_seasons_by_conference_season_id) {
    player_team_seasons = player_team_seasons_by_conference_season_id[conference_season_id];

    let conference_player_team_season_of_the_year = player_team_seasons[0];

    var a = new award(
      award_id,
      conference_player_team_season_of_the_year.player_team_season_id,
      null,
      this_week.week_id,
      this_week.season,
      "individual",
      "Conference POTY",
      "conference",
      "regular season",
      parseInt(conference_season_id),
      "Conference"
    );

    awards_to_save.push(a);
    award_id += 1;

    var player_team_seasons_by_position = index_group_sync(
      player_team_seasons,
      "group",
      "position"
    );

    for (const position in player_team_seasons_by_position) {
      var position_player_team_seasons = player_team_seasons_by_position[position];
      for (var i = 0; i < position_count_map[position]; i++) {
        let pts = position_player_team_seasons[i];
        var a = new award(
          award_id,
          pts.player_team_season_id,
          null,
          this_week.week_id,
          this_week.season,
          "position",
          position,
          "conference",
          "regular season",
          parseInt(conference_season_id),
          "First"
        );

        awards_to_save.push(a);
        award_id += 1;
      }

      for (var i = position_count_map[position]; i < position_count_map[position] * 2; i++) {
        let pts = position_player_team_seasons[i];
        var a = new award(
          award_id,
          pts.player_team_season_id,
          null,
          this_week.week_id,
          this_week.season,
          "position",
          position,
          "conference",
          "regular season",
          parseInt(conference_season_id),
          "Second"
        );

        awards_to_save.push(a);
        award_id += 1;
      }

      position_player_team_seasons = position_player_team_seasons.filter(
        (pts) => pts.class.class_name == "FR"
      );
      for (var i = 0; i < position_count_map[position]; i++) {
        let pts = position_player_team_seasons[i];
        console.log({
          position: position,
          position_player_team_seasons: position_player_team_seasons,
          i: i,
          pts: pts,
          conference_season_id: conference_season_id,
        });
        if (pts) {
          var a = new award(
            award_id,
            pts.player_team_season_id,
            null,
            this_week.week_id,
            this_week.season,
            "position",
            position,
            "conference",
            "regular season",
            parseInt(conference_season_id),
            "Freshman"
          );

          awards_to_save.push(a);
          award_id += 1;
        }
      }
    }
  }

  stopwatch(common, "Conference awards chosed");

   db.award.insert(awards_to_save);
   await db.saveDatabaseAsync();


  console.log({
    awards_to_save: awards_to_save,
    player_team_seasons: player_team_seasons,
    player_team_seasons_by_conference_season_id: player_team_seasons_by_conference_season_id,
    player_team_seasons_by_position: player_team_seasons_by_position,
  });
};

const advance_to_next_week = async (this_week, common) => {
  const db = await common.db;
  const ddb = await driver_db();
  const world = ddb.world.findOne({ world_id: common.world_id });
  const all_weeks = db.week.find({ season: { $gte: common.season } });
  const all_weeks_by_week_id = index_group_sync(all_weeks, "index", "week_id");

  console.log({ all_weeks: all_weeks });

  let next_week = all_weeks_by_week_id[this_week.week_id + 1];

  this_week.is_current = false;
  next_week.is_current = true;

  if (this_week.season != next_week.season) {
    const league_seasons = db.league_season.find({ season: { $gte: common.season } });

    const current_league_season = league_seasons.find((ls) => ls.season == this_week.season);
    const next_league_season = league_seasons.find((ls) => ls.season == next_week.season);

    current_league_season.is_current_season = false;
    next_league_season.is_current_season = true;

    db.league_season.update(current_league_season);
    db.league_season.update(next_league_season);

    world.current_season = next_week.season;
  } else {
    console.log("did not find different seasons");
  }

  db.week.update([this_week, next_week]);

  const current_team_season = db.team_season.findOne({
    team_id: world.user_team.team_id,
    season: common.season,
  });
  world.current_week = next_week.week_name;
  world.user_team.team_record = current_team_season.record_display;

  ddb.world.update(world);

  await db.saveDatabaseAsync();
  await ddb.saveDatabaseAsync();

  return next_week;
};

const refresh_page = async (next_week) => {
  window.onbeforeunload = function () {};
  await navigate_to_href(next_week.world_href);
};

const sim_action = async (duration, common) => {
  window.onbeforeunload = function () {
    return "Week is currently simming. Realoading may PERMANENTLY corrupt your save. Are you sure?";
  };

  const db = common.db;

  const season = common.world_object.current_season;
  common.world_id;
  common.world_object;

  const all_weeks = db.week.find({ season: { $gte: season } });

  const all_phases = db.phase.find({ season: { $gte: season } });
  const all_phases_by_phase_id = index_group_sync(all_phases, "index", "phase_id");
  console.log({
    all_phases_by_phase_id: all_phases_by_phase_id,
    all_weeks: all_weeks,
    season: season,
  });
  $.each(all_weeks, function (ind, week) {
    week.phase = all_phases_by_phase_id[week.phase_id];
    week.phase.season = season;
  });

  const current_week = all_weeks.find((w) => w.is_current);

  var sim_week_list = [];

  if (duration == "SimWeek") {
    sim_week_list = [current_week];
  } else if (duration == "SimPhase") {
    sim_week_list = all_weeks.filter(
      (w) => w.week_id >= current_week.week_id && w.phase_id == current_week.phase_id
    );
  } else {
    sim_week_list = [current_week];
  }
  for (var this_week of sim_week_list) {
    console.log({ team_game: team_game });
    await sim_week_games(this_week, common);

    console.log({ team_game: team_game });

    if (this_week.week_name == "Conference Championships") {
      await assign_conference_champions(this_week, common);
      await choose_all_americans(this_week, common);
    }

    if (this_week.phase.phase_name == "Bowl Season") {
      await process_bowl_results(common);
    }

    await calculate_conference_rankings(this_week, all_weeks, common);

    if (
      this_week.week_name != "Bowl Week 1" &&
      this_week.week_name != "Bowl Week 2" &&
      this_week.week_name != "Bowl Week 3"
    ) {
      await calculate_national_rankings(this_week, all_weeks, common);
    }

    if (this_week.week_name == "Bowl Week 4") {
      await close_out_season(this_week, common);
    }

    if (this_week.week_name == "Week 15") {
      await schedule_conference_championships(this_week, common);
    }

    if (this_week.week_name == "Early Signing Day") {
      await schedule_bowl_season(all_weeks, common);
    }

    if (this_week.week_name == "National Signing Day") {
      await initialize_new_season(this_week, common);
    }

    // if (this_week.week_name == "Season Recap") {
    //   await initialize_new_season(this_week, common);
    // }

    await choose_players_of_the_week(this_week, common);
    await calculate_primetime_games(this_week, all_weeks, common);
    //await weekly_recruiting(common);
    //await populate_all_depth_charts(common);
    //await calculate_team_needs(common);

    var next_week = await advance_to_next_week(this_week, common);
    console.log("Ready to refresh_page");
  }

  await refresh_page(next_week);
};

const search_input_action = () => {
  var val = $("#nav-search-input").val();
  val = val.trim();
  if (val.length > 0) {
    var world_id = $("#nav-search-input").attr("worldid");
    window.location = `/World/${world_id}/Search/${val}`;
  }
};

const change_dom_display = async (elem, display) => {
  $(elem).css('display', display);
  $(window).scrollTop(0);
};

const populate_player_modal = async (common, target) => {
  var db = common.db;
  var player_id = parseInt($(target).closest("*[player_id]").attr("player_id"));
  console.log({
    player_id: player_id,
    target: target,
    p: $(target).closest("*[player_id]"),
  });
  var season = common.season;

  var player = db.player.findOne({ player_id: player_id });
  var player_team_seasons = db.player_team_season.find({ player_id: player_id });
  player_team_seasons.map((pts) => pts.player_team_season_id);
  player.player_team_seasons = player_team_seasons;
  player.current_player_team_season = player_team_seasons.filter((pts) => pts.season == season)[0];

  var team_season_ids = player_team_seasons.map((pts) => pts.team_season_id);
  var team_seasons = db.team_season.find({team_season_id: {'$in': team_season_ids}});

  var player_team_ids = team_seasons.map((ts) => ts.team_id);
  var player_teams = db.team.find({team_id: {'$in': player_team_ids}});

  var c = 0;
  $.each(player_team_seasons, function (ind, pts) {
    pts.team_season = team_seasons[c];
    pts.team_season.team = player_teams[c];
    c += 1;
  });

  player.player_team_seasons = player_team_seasons;
  player.current_player_team_season = player.player_team_seasons.find(
    (pts) => pts.season == season
  );
  var current_team = player.current_player_team_season.team_season.team;

  console.log({
    current_team:current_team,
    player:player,
    player_teams:player_teams,
    player_team_ids:player_team_ids,
    team_seasons:team_seasons,
    team_season_ids:team_season_ids,
    player_team_seasons:player_team_seasons,
    player:player,
    season:season,
    player_id:player_id
  });

  var modal_page = {
    PrimaryColor: current_team.team_color_primary_hex,
    SecondaryColor: current_team.secondary_color_display,
  };
  console.log({ player: player, target: target, player_id: player_id });

  var modal_url = "/html_templates/common_templates/player_info_modal_template.njk";
  var html = await fetch(modal_url);
  html = await html.text();
  var renderedHtml = await nunjucks_env.renderString(html, {
    page: modal_page,
    player: player,
  });
  console.log({ renderedHtml: renderedHtml });
  $("#player-info-modal").html(renderedHtml);
  $("#player-info-modal").addClass("shown");

  $(window).on("click", async function (event) {
    if ($(event.target)[0] == $("#player-info-modal")[0]) {
      $("#player-info-modal").removeClass("shown");
      $(window).unbind();
      await player_face_listeners(common);
    }
  });

  await draw_player_faces(common);
  // if (player.player_face == undefined) {
  //   player.player_face = create_player_face("single", player.player_id, db);
  // }

  // display_player_face(
  //   player.player_face,
  //   {
  //     jersey: player.current_player_team_season.team_season.team.jersey,
  //     teamColors: player.current_player_team_season.team_season.team.jersey.teamColors,
  //   },
  //   "player-modal-player-face"
  // );
};

const add_listeners = async (common) => {
  $("#nav-search").on("click", function () {
    search_input_action();
  });

  $("#nav-search-input").on("keyup", function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      search_input_action();
      // Do something
    }
  });

  var SimMap = {
    SimThisWeek: "SimWeek",
    SimThisPhase: "SimPhase",
  };

  $(".sim-action:not(.w3-disabled)").click(async function (e) {
    $("#SimDayModal").css({ display: "block" });

    var sim_duration = SimMap[$(this).attr("id")];

    await sim_action(sim_duration, common);

    //TODO add notifications
    // $.notify(
    //   res.status,
    //   { globalPosition:"right bottom", className: 'error' }
    // );
  });

  $(".nav-tab-button").on("click", async function (event, target) {
    if ($(this).attr("id") == "nav-sidebar-tab") {
      $("#sidebar").addClass("sidebar-open");
      $(".sidebar-fade").addClass("sidebar-fade-open");

      $(".sidebar-fade-open").on("click", function () {
        $(this).removeClass("sidebar-fade-open");
        $("#sidebar").removeClass("sidebar-open");
      });
      return false;
    }

    var ClickedTab = $(event.target)[0];
    $.each($(".selected-tab"), function (index, tab) {
      var TargetTab = $(tab);
      $(TargetTab).css("backgroundColor", "");
      $(TargetTab).removeClass("selected-tab");
    });

    $(ClickedTab).addClass("selected-tab");
    console.log({ "common.render_content.page": common.render_content.page });
    $(ClickedTab).css("background-color", "#" + common.render_content.page.SecondaryColor);

    var NewTabContent = $("#" + $(this).attr("id").replace("-tab", ""))[0];

    $.each($(".tab-content"), async function (index, OldTabContent) {
      await change_dom_display($(OldTabContent), 'none');
    });

    await change_dom_display($(NewTabContent), 'block');
    setTimeout(async function(){
      await draw_player_faces(common);
    }, 1000);
    
  });

  $("#nav-team-dropdown-container .conference-button").on("click", function (event, target) {
    var conference_selected = $(event.currentTarget).attr("conference-button-val");

    if (conference_selected == "All") {
      $("#nav-team-dropdown-container .team-link").removeClass("w3-hide");
    } else {
      $("#nav-team-dropdown-container .team-link").addClass("w3-hide");
      $(
        '#nav-team-dropdown-container .team-link[conference-button-val="' +
          conference_selected +
          '"]'
      ).removeClass("w3-hide");
    }
  });
};

const assign_conference_champions = async (this_week, common) => {
  const db = await common.db;
  const season = common.season;

  let conferences = db.conference.find();
  let conferences_by_conference_id = index_group_sync(conferences, "index", "conference_id");

  let conference_seasons = db.conference_season.find({ season: season });

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

  let team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });
  const team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");
  const team_games_this_week = db.team_game.find({ week_id: this_week.week_id });

  const winning_team_seasons = team_games_this_week
    .filter((tg) => tg.is_winning_team)
    .map((tg) => team_seasons_by_team_season_id[tg.team_season_id]);

  const losing_team_seasons = team_games_this_week
    .filter((tg) => !tg.is_winning_team)
    .map((tg) => team_seasons_by_team_season_id[tg.team_season_id]);
  //winning_team_seasons = winning_team_seasons;

  let conference_seasons_to_put = [];
  winning_team_seasons.forEach(function (ts) {
    ts.results.conference_champion = true;

    let conference_season = conference_seasons_by_conference_season_id[ts.conference_season_id];
    conference_season.conference_champion_team_season_id = ts.team_season_id;

    conference_seasons_to_put.push(conference_season);

    if (conference_season.conference.divisions.length == 2) {
      ts.results.division_champion = true;
    } else if (
      conference_season.conference.divisions.length == 1 &&
      ts.rankings.division_rank[0] == 1
    ) {
      ts.results.division_champion = true;
    }
  });

  losing_team_seasons.forEach(function (ts) {
    let conference_season = conference_seasons_by_conference_season_id[ts.conference_season_id];
    // conference_season.conference_champion_team_season_id = ts.team_season_id;

    if (conference_season.conference.divisions.length == 2) {
      ts.results.division_champion = true;
    }
  });

  let championship_gameless_team_season_champs = [];
  let conference_seasons_without_championship_game = conference_seasons.filter(
    (cs) =>
      !cs.conference.schedule_format.hold_conference_championship_game &&
      !cs.conference.is_independent
  );
  conference_seasons_without_championship_game.forEach(function (cs) {
    let cs_team_seasons = team_seasons.filter(
      (ts) => ts.conference_season_id == cs.conference_season_id
    );
    let champ_ts = cs_team_seasons.find((ts) => ts.rankings.division_rank[0] == 1);

    champ_ts.results.conference_champion = true;
    championship_gameless_team_season_champs.push(champ_ts);

    cs.conference_champion_team_season_id = champ_ts.team_season_id;
    conference_seasons_to_put.push(cs);
  });

  conference_seasons_to_put.forEach((cs) => delete cs.conference);

  console.log("conference_seasons_to_put", {
    conference_seasons_to_put: conference_seasons_to_put,
  });

  db.team_season.update(winning_team_seasons);
  db.team_season.update(losing_team_seasons);
  db.team_season.update(championship_gameless_team_season_champs);
  db.conference_season.update(conference_seasons_to_put);

  await db.saveDatabaseAsync();

};

const schedule_conference_championships = async (this_week, common) => {
  console.log({ team_game: team_game });
  const db = await common.db;

  let conferences = db.conference.find();
  let conferences_by_conference_id = index_group_sync(conferences, "index", "conference_id");

  let next_week = db.week.findOne({ week_id: this_week.week_id + 1 });

  var conference_seasons = db.conference_season.find({ season: this_week.phase.season });

  conference_seasons = nest_children(
    conference_seasons,
    conferences_by_conference_id,
    "conference_id",
    "conference"
  );

  conference_seasons = conference_seasons.filter(
    (cs) => cs.conference.schedule_format.hold_conference_championship_game
  );

  var team_seasons = db.team_season.find({ season: this_week.phase.season, team_id: { $gt: 0 } });
  team_seasons = team_seasons.filter((ts) => ts.rankings.division_rank[0] <= 2);
  var team_seasons_by_conference_season_id = index_group_sync(
    team_seasons,
    "group",
    "conference_season_id"
  );

  var next_game_id = db.game.nextId("game_id");
  var next_team_game_id = db.team_game.nextId("team_game_id");

  var team_a = 0,
    team_b = 0,
    team_games_to_create = [],
    games_to_create = [];

  $.each(conference_seasons, function (ind, conference_season) {
    var championship_teams =
      team_seasons_by_conference_season_id[conference_season.conference_season_id];

    if (
      conference_season.conference.schedule_format.conference_championship_selection_method ==
      "top 2"
    ) {
      championship_teams = championship_teams.sort(
        (ts_a, ts_b) => ts_a.rankings.division_rank[0] - ts_b.rankings.division_rank[0]
      );
      championship_teams = championship_teams.slice(0, 2);
    } else if (
      conference_season.conference.schedule_format.conference_championship_selection_method ==
      "division winners"
    ) {
      championship_teams = championship_teams.filter((ts) => ts.rankings.division_rank[0] == 1);
    }

    championship_teams = championship_teams.map((ts) => ts.team_season_id);
    [team_a, team_b] = championship_teams;
    console.log({
      team_game: team_game,
      championship_teams: championship_teams,
      conference_season: conference_season,
    });

    var team_game_a = new team_game({
      world_id: common.world_id,
      season: common.season,
      team_game_id: next_team_game_id,
      is_home_team: true,
      opponent_team_game_id: next_team_game_id + 1,
      week_id: next_week.week_id,
      game_id: next_game_id,
      team_season_id: parseInt(team_a),
      opponent_team_season_id: parseInt(team_b),
    });
    var team_game_b = new team_game({
      world_id: common.world_id,
      season: common.season,
      team_game_id: next_team_game_id + 1,
      is_home_team: false,
      opponent_team_game_id: next_team_game_id,
      week_id: next_week.week_id,
      game_id: next_game_id,
      team_season_id: parseInt(team_b),
      opponent_team_season_id: parseInt(team_a),
    });

    team_games_to_create.push(team_game_a);
    team_games_to_create.push(team_game_b);

    games_to_create.push({
      game_id: next_game_id,
      season: common.season,
      home_team_season_id: parseInt(team_a),
      away_team_season_id: parseInt(team_b),
      home_team_game_id: next_team_game_id,
      away_team_game_id: next_team_game_id + 1,
      week_id: next_week.week_id,
      game_time: "7:05PM",
      was_played: false,
      outcome: {
        home_team_score: null,
        away_team_score: null,
        winning_team_season_id: null,
        losing_team_season_id: null,
      },
      rivalry: null,
      bowl: null,
      is_neutral_site_game: true,
      broadcast: { regional_broadcast: false, national_broadcast: false },
      world_id: common.world_id,
    });

    next_game_id += 1;
    next_team_game_id += 2;
  });

  db.game.insert(games_to_create);
  db.team_game.insert(team_games_to_create);

  await db.saveDatabaseAsync();

};

const process_bowl_results = async (common) => {
  const db = common.db;
  const season = common.season;

  var phases = db.phase.find({ season: season });
  var phases_by_phase_id = index_group_sync(phases, "index", "phase_id");
  var weeks = db.week.find({ season: season });
  weeks = nest_children(weeks, phases_by_phase_id, "phase_id", "phase");

  console.log({ weeks: weeks });

  var this_week = weeks.find((w) => w.is_current);

  var bowl_weeks = index_group_sync(
    weeks.filter((w) => w.phase.phase_name == "Bowl Season"),
    "index",
    "week_name"
  );

  var current_league_season = db.league_season.findOne({ season: season });

  var current_playoff_round_index = current_league_season.playoffs.playoff_rounds.findIndex(
    (pr) => pr.week_name == this_week.week_name
  );

  var teams = db.team.find({ team_id: { $gt: 0 } });
  index_group_sync(teams, "index", "team_id");

  var team_seasons = db.team_season.find({ season: common.season, team_id: { $gt: 0 } });
  var team_seasons_by_team_season_id = index_group_sync(team_seasons, "index", "team_season_id");

  var games_this_week = db.game.find({ week_id: this_week.week_id });
  var team_games_by_game_id = index_group_sync(
     db.team_game.find({ week_id: this_week.week_id }),
    "group",
    "game_id"
  );

  var team_seasons_to_save = [];

  $.each(games_this_week, function (ind, game) {
    let winning_team_season =
      team_seasons_by_team_season_id[game.outcome.winning_team.team_season_id];
    let losing_team_season =
      team_seasons_by_team_season_id[game.outcome.losing_team.team_season_id];

    winning_team_season.results.bowl = deep_copy(game.bowl);
    winning_team_season.results.bowl.is_winning_team = true;

    losing_team_season.results.bowl = deep_copy(game.bowl);
    losing_team_season.results.bowl.is_winning_team = false;

    winning_team_season.results.bowl.game_id = game.game_id;
    losing_team_season.results.bowl.game_id = game.game_id;

    winning_team_season.results.bowl.opposing_team_season_id = losing_team_season.team_season_id;
    losing_team_season.results.bowl.opposing_team_season_id = winning_team_season.team_season_id;

    if (game.bowl.bowl_name == "National Championship") {
      winning_team_season.results.national_champion = true;
      current_league_season.playoffs.playoffs_complete = true;
    }

    team_seasons_to_save.push(winning_team_season);
    team_seasons_to_save.push(losing_team_season);
    console.log({
      winning_team_season: winning_team_season,
      losing_team_season: losing_team_season,
      team_seasons_to_save: team_seasons_to_save,
      game: game,
      bowl: game.bowl,
    });
  });

  var team_a = 0,
    team_b = 0,
    team_games_to_create = [],
    games_to_create = [];

  console.log({
    current_playoff_round_index: current_playoff_round_index,
    "current_league_season.playoffs": current_league_season.playoffs,
  });

  if (
    current_playoff_round_index >= 0 &&
    current_playoff_round_index < current_league_season.playoffs.playoff_rounds.length - 1
  ) {
    var current_playoff_round =
      current_league_season.playoffs.playoff_rounds[current_playoff_round_index];
    current_league_season.playoffs.playoff_rounds[
      current_playoff_round_index
    ].is_current_round = false;
    current_league_season.playoffs.playoff_rounds[
      current_playoff_round_index + 1
    ].is_current_round = true;
    var next_playoff_round =
      current_league_season.playoffs.playoff_rounds[current_playoff_round_index + 1];
    var next_playoff_round_week = bowl_weeks[next_playoff_round.week_name];

    var team_seasons_advancing = [];

    for (const playoff_game of current_playoff_round.playoff_games) {
      if (playoff_game.bye_game) {
        team_seasons_advancing.push({
          seed: playoff_game.team_objs[0].seed,
          team_season: team_seasons_by_team_season_id[playoff_game.team_objs[0].team_season_id],
        });
      } else {
        var playoff_team_games = team_games_by_game_id[playoff_game.game_id];
        var winning_team_game = playoff_team_games.find((tg) => tg.is_winning_team);
        var winning_team_season_id = winning_team_game.team_season_id;

        team_seasons_advancing.push({
          seed: playoff_game.team_objs.find((to) => to.team_season_id == winning_team_season_id)
            .seed,
          team_season: team_seasons_by_team_season_id[winning_team_season_id],
        });
      }
    }

    team_seasons_advancing = team_seasons_advancing.sort(
      (ts_a, ts_b) => ts_b.team_season.playoff.seed - ts_a.team_season.playoff.seed
    );

    console.log({ team_seasons_advancing: team_seasons_advancing });

    if (team_seasons_advancing.length > 0) {
      var next_game_id = db.game.nextId("game_id");
      var next_team_game_id = db.team_game.nextId("team_game_id");

      var week_id = next_playoff_round_week.week_id;
      var counter = 0;

      while (team_seasons_advancing.length > 0) {
        var team_season_a = team_seasons_advancing.pop();
        team_seasons_advancing = team_seasons_advancing.reverse();
        var team_season_b = team_seasons_advancing.pop();
        team_seasons_advancing = team_seasons_advancing.reverse();

        var team_a = team_season_a.team_season.team_season_id;
        var team_b = team_season_b.team_season.team_season_id;

        var team_game_a = new team_game({
          world_id: common.world_id,
          season: common.season,
          team_game_id: next_team_game_id,
          is_home_team: true,
          opponent_team_game_id: next_team_game_id + 1,
          week_id: week_id,
          game_id: next_game_id,
          team_season_id: parseInt(team_a),
          opponent_team_season_id: parseInt(team_b),
        });
        var team_game_b = new team_game({
          world_id: common.world_id,
          season: common.season,
          team_game_id: next_team_game_id + 1,
          is_home_team: false,
          opponent_team_game_id: next_team_game_id,
          week_id: week_id,
          game_id: next_game_id,
          team_season_id: parseInt(team_b),
          opponent_team_season_id: parseInt(team_a),
        });

        team_games_to_create.push(team_game_a);
        team_games_to_create.push(team_game_b);

        games_to_create.push({
          game_id: next_game_id,
          season: common.season,
          home_team_season_id: parseInt(team_a),
          away_team_season_id: parseInt(team_b),
          home_team_game_id: next_team_game_id,
          away_team_game_id: next_team_game_id + 1,
          week_id: week_id,
          game_time: "7:05PM",
          was_played: false,
          outcome: {
            home_team_score: null,
            away_team_score: null,
            winning_team_season_id: null,
            losing_team_season_id: null,
          },
          rivalry: null,
          bowl: { bowl_name: next_playoff_round.round_name, is_playoff: true },
          broadcast: { regional_broadcast: false, national_broadcast: false },
          world_id: common.world_id,
        });

        current_league_season.playoffs.playoff_rounds[
          current_playoff_round_index + 1
        ].playoff_games[counter].team_objs = [];
        current_league_season.playoffs.playoff_rounds[
          current_playoff_round_index + 1
        ].playoff_games[counter].team_objs.push({
          seed: team_season_a.seed,
          team_season_id: team_a,
          team_game_id: next_team_game_id,
        });
        current_league_season.playoffs.playoff_rounds[
          current_playoff_round_index + 1
        ].playoff_games[counter].team_objs.push({
          seed: team_season_b.seed,
          team_season_id: team_b,
          team_game_id: next_team_game_id + 1,
        });

        current_league_season.playoffs.playoff_rounds[
          current_playoff_round_index + 1
        ].playoff_games[counter].game_id = next_game_id;

        counter += 1;
        next_team_game_id = next_team_game_id + 2;
        next_game_id = next_game_id + 1;
      }
    }
  }

  await Promise.all([
    db.game.insert(games_to_create),
    db.team_game.insert(team_games_to_create),
    db.team_season.update(team_seasons_to_save),
    db.league_season.update(current_league_season),
  ]);

  await db.saveDatabaseAsync();

};

const schedule_bowl_season = async (all_weeks, common) => {
  let bowl_url = `/data/import_json/bowls.json`;
  let bowl_json = await fetch(bowl_url);
  let bowls = await bowl_json.json();

  const db = await common.db;

  var current_league_season = db.league_season.find({ season: common.season });
  current_league_season = current_league_season[0];

  var number_playoff_teams = current_league_season.playoffs.number_playoff_teams;

  var team_seasons = db.team_season.find({ season: common.season, team_id: { $gt: 0 } });
  index_group_sync(
   db.team.find({"team_id": {$gt:0}}),
    "index",
    "team_id"
  );

  var num_teams = db.team.find({"team_id": {$gt:0}}).length;

  var max_bowl_bound_teams = num_teams - number_playoff_teams;
  var max_bowls = Math.floor(max_bowl_bound_teams / 2);

  bowls = bowls.slice(0, max_bowls);

  team_seasons = team_seasons.sort(function (team_season_a, team_season_b) {
    if (team_season_a.rankings.national_rank[0] < team_season_b.rankings.national_rank[0])
      return -1;
    if (team_season_a.rankings.national_rank[0] > team_season_b.rankings.national_rank[0]) return 1;
    return 0;
  });

  let number_guaranteed_conference_champions_in_playoff = 6;
  let top_playoff_seeds_saved_for_conference_champions = 4;
  let conference_champions_in_playoff = team_seasons
    .filter((ts) => ts.results.conference_champion)
    .slice(0, number_guaranteed_conference_champions_in_playoff);
  let top_seeded_conference_champions_in_playoff = conference_champions_in_playoff.slice(
    0,
    top_playoff_seeds_saved_for_conference_champions
  );

  let playoff_team_season_ids = new Set(
    conference_champions_in_playoff.map((ts) => ts.team_season_id)
  );
  let top_seeded_playoff_team_season_ids = new Set(
    top_seeded_conference_champions_in_playoff.map((ts) => ts.team_season_id)
  );

  let ts_ind = 0;
  while (playoff_team_season_ids.size < number_playoff_teams) {
    let ts = team_seasons[ts_ind];
    if (!playoff_team_season_ids.has(ts.team_season_id)) {
      playoff_team_season_ids.insert(ts.team_season_id);
    }
    ts_ind += 1;
  }

  var playoff_bound_team_seasons = top_seeded_conference_champions_in_playoff.concat(
    team_seasons.filter(
      (ts) =>
        !top_seeded_playoff_team_season_ids.has(ts.team_season_id) &&
        playoff_team_season_ids.has(ts.team_season_id)
    )
  );
  playoff_bound_team_seasons.forEach((ts, ind) => (ts.playoff.seed = ind + 1));

  console.log({ playoff_bound_team_seasons: playoff_bound_team_seasons });

  var bowl_bound_team_seasons = team_seasons.filter(
    (ts) =>
      !playoff_team_season_ids.has(ts.team_season_id) &&
      ts.rankings.national_rank[0] <= bowls.length * 2 + number_playoff_teams
  );

  var bowl_weeks = index_group_sync(
    all_weeks.filter((w) => w.phase.phase_name == "Bowl Season"),
    "index",
    "week_name"
  );

  var taken_team_season_ids = [],
    possible_team_seasons = [],
    chosen_team_season = null;

  $.each(bowls, function (ind, bowl) {
    possible_team_seasons = bowl_bound_team_seasons
      .filter((ts) => !taken_team_season_ids.includes(ts.team_season_id))
      .slice(0, 5);
    bowl.teams = [];
    chosen_team_season =
      possible_team_seasons[Math.floor(Math.random() * possible_team_seasons.length)];
    bowl.teams.push(chosen_team_season);

    taken_team_season_ids.push(chosen_team_season.team_season_id);

    (chosen_team_season = null), (loop_count = 0);
    possible_team_seasons = possible_team_seasons.filter(
      (ts) => !taken_team_season_ids.includes(ts.team_season_id)
    );

    while (
      (chosen_team_season == null ||
        chosen_team_season.conference_season_id == bowl.teams[0].conference_season_id ||
        chosen_team_season.record.defeated_teams.includes(bowl.teams[0].team_season_id) ||
        bowl.teams[0].record.defeated_teams.includes(chosen_team_season.team_season_id)) &&
      loop_count < 100
    ) {
      chosen_team_season =
        possible_team_seasons[Math.floor(Math.random() * possible_team_seasons.length)];
      loop_count += 1;
    }

    if (chosen_team_season != undefined) {
      bowl.teams.push(chosen_team_season);
      taken_team_season_ids.push(chosen_team_season.team_season_id);
    }
  });

  var next_game_id = db.game.nextId("game_id");
  var next_team_game_id = db.team_game.nextId("team_game_id");

  if (!(last_team_game === undefined)) {
    next_team_game_id = last_team_game.team_game_id + 1;
  }

  var team_a = 0,
    team_b = 0,
    team_games_to_create = [],
    games_to_create = [],
    team_ids = [];

  const playoff_round = current_league_season.playoffs.playoff_rounds[0];
  const playoff_week_id = bowl_weeks[playoff_round.week_name].week_id;

  for (const playoff_game of playoff_round.playoff_games) {
    team_ids = [];
    for (const team_obj of playoff_game.team_objs) {
      team_obj.team_season_id = playoff_bound_team_seasons[team_obj.seed - 1].team_season_id;
    }

    console.log({ playoff_game: playoff_game });

    if (playoff_game.bye_game) {
      playoff_game.game_id = null;
    } else {
      [team_season_id_a, team_season_id_b] = playoff_game.team_objs.map((to) => to.team_season_id);

      var team_game_a = new team_game({
        world_id: common.world_id,
        season: common.season,
        team_game_id: next_team_game_id,
        is_home_team: true,
        opponent_team_game_id: next_team_game_id + 1,
        week_id: playoff_week_id,
        game_id: next_game_id,
        team_season_id: parseInt(team_season_id_a),
        opponent_team_season_id: parseInt(team_season_id_b),
      });
      var team_game_b = new team_game({
        world_id: common.world_id,
        season: common.season,
        team_game_id: next_team_game_id + 1,
        is_home_team: false,
        opponent_team_game_id: next_team_game_id,
        week_id: playoff_week_id,
        game_id: next_game_id,
        team_season_id: parseInt(team_season_id_b),
        opponent_team_season_id: parseInt(team_season_id_a),
      });

      team_games_to_create.push(team_game_a);
      team_games_to_create.push(team_game_b);

      games_to_create.push({
        game_id: next_game_id,
        season: common.season,
        home_team_season_id: parseInt(team_a),
        away_team_season_id: parseInt(team_b),
        home_team_game_id: next_team_game_id,
        away_team_game_id: next_team_game_id + 1,
        week_id: playoff_week_id,
        game_time: "7:05PM",
        was_played: false,
        outcome: {
          home_team_score: null,
          away_team_score: null,
          winning_team_season_id: null,
          losing_team_season_id: null,
        },
        rivalry: null,
        is_neutral_site_game: true,
        bowl: { bowl_name: playoff_round.round_name, is_playoff: true },
        broadcast: { regional_broadcast: false, national_broadcast: false },
        world_id: common.world_id,
      });

      playoff_game.game_id = next_game_id;

      playoff_game.team_objs[0].team_game_id = next_team_game_id;
      playoff_game.team_objs[1].team_game_id = next_team_game_id + 1;

      next_game_id += 1;
      next_team_game_id += 2;
    }
  }

  playoff_round.is_current_round = true;
  current_league_season.playoffs.playoffs_started = true;
  current_league_season.playoffs.playoff_rounds[0] = playoff_round;

  $.each(bowls, function (ind, bowl) {
    team_ids = bowl.teams.map((ts) => ts.team_season_id);
    [team_a, team_b] = team_ids;

    week_id = bowl_weeks[bowl.bowl_week_name].week_id;

    var team_game_a = new team_game({
      world_id: common.world_id,
      season: common.season,
      team_game_id: next_team_game_id,
      is_home_team: true,
      opponent_team_game_id: next_team_game_id + 1,
      week_id: week_id,
      game_id: next_game_id,
      team_season_id: parseInt(team_a),
      opponent_team_season_id: parseInt(team_b),
    });
    var team_game_b = new team_game({
      world_id: common.world_id,
      season: common.season,
      team_game_id: next_team_game_id + 1,
      is_home_team: false,
      opponent_team_game_id: next_team_game_id,
      week_id: week_id,
      game_id: next_game_id,
      team_season_id: parseInt(team_b),
      opponent_team_season_id: parseInt(team_a),
    });

    team_games_to_create.push(team_game_a);
    team_games_to_create.push(team_game_b);

    games_to_create.push({
      game_id: next_game_id,
      season: common.season,
      home_team_season_id: parseInt(team_a),
      away_team_season_id: parseInt(team_b),
      home_team_game_id: next_team_game_id,
      away_team_game_id: next_team_game_id + 1,
      week_id: week_id,
      game_time: "7:05PM",
      was_played: false,
      outcome: {
        home_team_score: null,
        away_team_score: null,
        winning_team_season_id: null,
        losing_team_season_id: null,
      },
      rivalry: null,
      bowl: { bowl_name: bowl.bowl_name, is_playoff: false },
      broadcast: { regional_broadcast: false, national_broadcast: false },
      world_id: common.world_id,
    });

    next_game_id += 1;
    next_team_game_id += 2;
  });

  await Promise.all([
    db.game.insert(games_to_create),
    db.team_game.insert(team_games_to_create),
    db.league_season.update(current_league_season),
    db.team_season.update(playoff_bound_team_seasons),
  ]);

  await db.saveDatabaseAsync();

};

const schedule_game = (common, scheduling_dict, team_set, game_type, rival_obj, loop_count = 0) => {
  var team_a = team_set[0],
    team_b = team_set[1];
  if (team_b == undefined) {
    return "No team b";
  }

  if (Math.random() < 0.5) {
    [team_a, team_b] = [team_b, team_a];
  }

  var is_conference_game =
    scheduling_dict.team_season_schedule_tracker[team_a].conference_season_id ==
    scheduling_dict.team_season_schedule_tracker[team_b].conference_season_id;

  var keep_game =
    !scheduling_dict.team_season_schedule_tracker[team_b].opponents_scheduled.has(team_a);

  var schedule_trend_modifier = 1;
  if (game_type == "conference") {
    is_conference_game = true;
    keep_game = keep_game && is_conference_game;
  } else if (game_type == "non_conference") {
    keep_game = keep_game && !is_conference_game;
    schedule_trend_modifier = -16;
  } else {
    alert("some fuck up in scheduling");
  }

  if (
    keep_game &&
    is_conference_game &&
    scheduling_dict.team_season_schedule_tracker[team_a]["conference"].games_to_schedule > 0 &&
    scheduling_dict.team_season_schedule_tracker[team_b]["conference"].games_to_schedule > 0
  ) {
    keep_game = true;
  } else if (
    keep_game &&
    !is_conference_game &&
    scheduling_dict.team_season_schedule_tracker[team_a]["non_conference"].games_to_schedule > 0 &&
    scheduling_dict.team_season_schedule_tracker[team_b]["non_conference"].games_to_schedule > 0
  ) {
    keep_game = true;
  } else {
    keep_game = false;
  }

  window.distance_tracking_map = window.distance_tracking_map || {};
  if (keep_game && !is_conference_game) {
    let distance_between_schools = distance_between_cities(
      scheduling_dict.team_season_schedule_tracker[team_a].city,
      scheduling_dict.team_season_schedule_tracker[team_b].city,
      window.distance_tracking_map
    );
    if (
      distance_between_schools >
        scheduling_dict.team_season_schedule_tracker[team_a].non_conference
          .max_ooc_travel_distance +
          loop_count * 2 ||
      distance_between_schools >
        scheduling_dict.team_season_schedule_tracker[team_b].non_conference
          .max_ooc_travel_distance +
          loop_count * 2
    ) {
      keep_game = false;
    }
  }

  if (keep_game) {
    var available_weeks = set_intersect(
      scheduling_dict.team_season_schedule_tracker[team_a].available_week_ids,
      scheduling_dict.team_season_schedule_tracker[team_b].available_week_ids
    );
    available_weeks = [...available_weeks];
    if (available_weeks.length > 0) {
      if (is_conference_game) {
        if (
          scheduling_dict.team_season_schedule_tracker[team_b]["conference"].net_home_games <
          scheduling_dict.team_season_schedule_tracker[team_a]["conference"].net_home_games
        ) {
          [team_a, team_b] = [team_b, team_a];
        }
      } else {
        let dict_for_random = [team_a, team_b].map(function (team_id) {
          return [
            team_id,
            scheduling_dict.team_season_schedule_tracker[team_id].team.team_ratings
              .program_history ** 2,
          ];
        });
        dict_for_random = Object.fromEntries(dict_for_random);
        let chosen_home_team = weighted_random_choice(dict_for_random);
        let chosen_away_team = [team_a, team_b].find((team_id) => team_id != chosen_home_team);

        team_a = chosen_home_team;
        team_b = chosen_away_team;
      }

      available_weeks = available_weeks.map(function (week_id) {
        // console.log({
        //   week_id:week_id,
        //   team_a:team_a,
        //   team_b:team_b,
        //   scheduling_dict:scheduling_dict,
        //   'scheduling_dict.team_season_schedule_tracker[team_ind]': scheduling_dict.team_season_schedule_tracker[team_a],
        //   'scheduling_dict.team_season_schedule_tracker[team_b]': scheduling_dict.team_season_schedule_tracker[team_b],
        // })
        let additional_modifier = 1;
        for (let team_ind of [team_a, team_b]) {
          for (let adj_ind of [-1, 1]) {
            if (
              scheduling_dict.team_season_schedule_tracker[team_ind].available_week_ids.has(
                week_id + adj_ind
              ) ||
              week_id == scheduling_dict.all_week_ids[0] ||
              week_id == scheduling_dict.all_week_ids[scheduling_dict.all_week_ids.length - 1]
            ) {
              additional_modifier += 1;
            }
          }
        }

        return [
          week_id,
          Math.abs(
            (scheduling_dict.all_weeks_by_week_id[week_id].schedule_week_number +
              schedule_trend_modifier) **
              (1 * additional_modifier)
          ),
        ];
      });
      available_weeks = Object.fromEntries(available_weeks);
      var chosen_week_id = parseInt(weighted_random_choice(available_weeks));

      if (rival_obj != null) {
        if (rival_obj.preferred_week_id != undefined) {
          if (rival_obj.preferred_week_id in available_weeks) {
            chosen_week_id = rival_obj.preferred_week_id;
          }
        }
      }

      scheduling_dict.team_season_schedule_tracker[team_a][game_type].games_to_schedule -= 1;
      scheduling_dict.team_season_schedule_tracker[team_a][game_type].games_scheduled += 1;
      scheduling_dict.team_season_schedule_tracker[team_a][game_type].home_games += 1;
      scheduling_dict.team_season_schedule_tracker[team_a][game_type].net_home_games += 1;
      scheduling_dict.team_season_schedule_tracker[team_a].weeks_scheduled.add(chosen_week_id);
      scheduling_dict.team_season_schedule_tracker[team_a].available_week_ids.delete(
        chosen_week_id
      );
      scheduling_dict.team_season_schedule_tracker[team_a].opponents_scheduled.add(team_b);

      scheduling_dict.team_season_schedule_tracker[team_b][game_type].games_to_schedule -= 1;
      scheduling_dict.team_season_schedule_tracker[team_b][game_type].games_scheduled += 1;
      scheduling_dict.team_season_schedule_tracker[team_b][game_type].away_games += 1;
      scheduling_dict.team_season_schedule_tracker[team_b][game_type].net_home_games -= 1;
      scheduling_dict.team_season_schedule_tracker[team_b].weeks_scheduled.add(chosen_week_id);
      scheduling_dict.team_season_schedule_tracker[team_b].available_week_ids.delete(
        chosen_week_id
      );
      scheduling_dict.team_season_schedule_tracker[team_b].opponents_scheduled.add(team_a);

      if (!is_conference_game) {
        for (let team_combos of [
          [team_a, team_b],
          [team_b, team_a],
        ]) {
          let team_ind = team_combos[0];
          let other_team_ind = team_combos[1];
          let other_team_quadrant =
            scheduling_dict.team_season_schedule_tracker[other_team_ind].team_quadrant;
          let team_schedule_obj = scheduling_dict.team_season_schedule_tracker[team_ind];

          other_team_quadrant =
            other_team_quadrant +
            ([0, -1].find(
              (m) =>
                team_schedule_obj.non_conference.schedule_team_quadrants[other_team_quadrant + m] >
                0
            ) || 0);

          team_schedule_obj.non_conference.schedule_team_quadrants[other_team_quadrant] -= 1;
        }
        // console.log({scheduling_dict:scheduling_dict, team_a:team_a, team_b:team_b, 'scheduling_dict.team_season_schedule_tracker[team_b]': scheduling_dict.team_season_schedule_tracker[team_b]})
      }

      // console.log({scheduling_dict:scheduling_dict, team_a:team_a, team_b:team_b, 'scheduling_dict.team_season_schedule_tracker[team_b]': scheduling_dict.team_season_schedule_tracker[team_b]})

      var team_game_a = new team_game({
        world_id: scheduling_dict.world_id,
        season: scheduling_dict.season,
        team_game_id: scheduling_dict.next_team_game_id,
        is_home_team: true,
        opponent_team_game_id: scheduling_dict.next_team_game_id + 1,
        week_id: chosen_week_id,
        game_id: scheduling_dict.next_game_id,
        is_conference_game: is_conference_game,
        team_season_id: parseInt(team_a),
        opponent_team_season_id: parseInt(team_b),
      });
      var team_game_b = new team_game({
        world_id: scheduling_dict.world_id,
        season: scheduling_dict.season,
        team_game_id: scheduling_dict.next_team_game_id + 1,
        is_home_team: false,
        opponent_team_game_id: scheduling_dict.next_team_game_id,
        week_id: chosen_week_id,
        game_id: scheduling_dict.next_game_id,
        is_conference_game: is_conference_game,
        team_season_id: parseInt(team_b),
        opponent_team_season_id: parseInt(team_a),
      });

      scheduling_dict.team_games_to_create.push(team_game_a);
      scheduling_dict.team_games_to_create.push(team_game_b);

      scheduling_dict.team_games_to_create_ids.push(scheduling_dict.next_team_game_id);
      scheduling_dict.team_games_to_create_ids.push(scheduling_dict.next_team_game_id + 1);

      scheduling_dict.games_to_create.push({
        game_id: scheduling_dict.next_game_id,
        season: scheduling_dict.season,
        home_team_season_id: parseInt(team_a),
        away_team_season_id: parseInt(team_b),
        home_team_game_id: scheduling_dict.next_team_game_id,
        away_team_game_id: scheduling_dict.next_team_game_id + 1,
        week_id: chosen_week_id,
        game_time: "7:05PM",
        was_played: false,
        outcome: {
          home_team_score: null,
          away_team_score: null,
          winning_team_season_id: null,
          losing_team_season_id: null,
        },
        rivalry: rival_obj,
        bowl: null,
        broadcast: { regional_broadcast: false, national_broadcast: false },
        world_id: scheduling_dict.world_id,
        is_conference_game: is_conference_game,
      });

      scheduling_dict.games_to_create_ids.push(scheduling_dict.next_game_id);

      scheduling_dict.next_game_id += 1;
      scheduling_dict.next_team_game_id += 2;

      return "Scheduled";
    } else {
      return "No available weeks";
    }
  } else {
    console.log("Issue with teams already playing", {
      scheduling_dict: scheduling_dict,
      team_set: team_set,
      game_type: game_type,
      rival_obj: rival_obj,
    });
    return "Issue with teams already playing";
  }
};

const inches_to_height = (all_inches) => {
  var feet = Math.floor(all_inches / 12);
  var inches = Math.floor(all_inches % 12);

  return `${feet}'${inches}"`;
};

const body_from_position = (position) => {
  const position_measurables = {
    coach: {
      height_avg: 72,
      height_std: 1,
      weight_avg: 230,
      weight_std: 25,
    },
    QB: {
      height_avg: 74.91,
      height_std: 1.79,
      weight_avg: 212.94,
      weight_std: 10.64,
    },
    RB: {
      height_avg: 70.24,
      height_std: 1.83,
      weight_avg: 212.94,
      weight_std: 13.65,
    },
    FB: { height_avg: 70, height_std: 2, weight_avg: 220, weight_std: 13.65 },
    WR: {
      height_avg: 72.7,
      height_std: 2.36,
      weight_avg: 202.91,
      weight_std: 15.36,
    },
    TE: {
      height_avg: 76.2,
      height_std: 1.34,
      weight_avg: 251.48,
      weight_std: 8.7,
    },
    OT: {
      height_avg: 77.61,
      height_std: 1.12,
      weight_avg: 313.74,
      weight_std: 10.95,
    },
    IOL: {
      height_avg: 76.07,
      height_std: 1.16,
      weight_avg: 314.75,
      weight_std: 11.76,
    },
    EDGE: {
      height_avg: 75.83,
      height_std: 1.44,
      weight_avg: 260,
      weight_std: 14.81,
    },
    DL: {
      height_avg: 74.92,
      height_std: 1.43,
      weight_avg: 307.49,
      weight_std: 15.8,
    },
    LB: {
      height_avg: 73.22,
      height_std: 1.27,
      weight_avg: 240.96,
      weight_std: 6.6,
    },
    CB: {
      height_avg: 71.35,
      height_std: 1.59,
      weight_avg: 193.42,
      weight_std: 8.76,
    },
    S: {
      height_avg: 72.15,
      height_std: 1.5,
      weight_avg: 206.38,
      weight_std: 9.08,
    },
    K: { height_avg: 71.89, height_std: 2, weight_avg: 195, weight_std: 17 },
    P: {
      height_avg: 74.31,
      height_std: 1.89,
      weight_avg: 213,
      weight_std: 14.6,
    },
  };

  var height_inches = Math.floor(
    normal_trunc(
      position_measurables[position]["height_avg"],
      position_measurables[position]["height_std"],
      66,
      81
    )
  );
  var body = { height_inches: height_inches };

  var height_variations = 0; //(height_inches - position_measurables[position]['height_avg']) / position_measurables[position]['height_std'];
  var weight = Math.floor(
    normal_trunc(
      position_measurables[position]["weight_avg"] * (1 + height_variations / 4),
      position_measurables[position]["weight_std"] * 0.8,
      150,
      390
    )
  );

  body.weight = weight;
  body.height = inches_to_height(body.height_inches);

  return body;
};

const initialize_scoreboard = () => {
  if ($(".MultiCarousel-inner").children().length == 0) {
    $(".scoreboard-slideshow").remove();
    return 0;
  }
  var itemsMainDiv = ".MultiCarousel";
  var itemsDiv = ".MultiCarousel-inner";
  var itemWidth = "";
  var initialOffset = 20;
  $(".leftLst, .rightLst").click(function () {
    var condition = $(this).hasClass("leftLst");
    if (condition) click(0, this);
    else click(1, this);
  });

  ResCarouselSize();

  $(window).resize(function () {
    ResCarouselSize();
  });

  //this function define the size of the items
  function ResCarouselSize() {
    var incno = 0;
    var dataItems = "data-items";
    var itemClass = ".scoreboard-carousel-item";
    var id = 0;
    var btnParentSb = "";
    var itemsSplit = "";
    var sampwidth = $(itemsMainDiv).width();
    var bodyWidth = $("body").width();
    $(itemsDiv).each(function () {
      id = id + 1;
      var itemNumbers = $(this).find(itemClass).length;
      btnParentSb = $(this).parent().attr(dataItems);
      console.log({});
      itemsSplit = btnParentSb.split(",");
      $(this)
        .parent()
        .attr("id", "MultiCarousel" + id);

      if (bodyWidth >= 1200) {
        incno = itemsSplit[3];
        itemWidth = sampwidth / incno;
      } else if (bodyWidth >= 992) {
        incno = itemsSplit[2];
        itemWidth = sampwidth / incno;
      } else if (bodyWidth >= 768) {
        incno = itemsSplit[1];
        itemWidth = sampwidth / incno;
      } else {
        incno = itemsSplit[0];
        itemWidth = sampwidth / incno;
      }
      $(this).css({
        transform: "translateX(" + initialOffset + "px)",
        width: itemWidth * itemNumbers,
      });
      $(this)
        .find(itemClass)
        .each(function () {
          $(this).outerWidth(itemWidth);
        });

      $(".leftLst").addClass("over");
      $(".rightLst").removeClass("over");
    });
  }

  //this function used to move the items
  function ResCarousel(e, el, s) {
    var leftBtn = ".leftLst";
    var rightBtn = ".rightLst";
    var translateXval = "";
    var divStyle = $(el + " " + itemsDiv).css("transform");
    var values = divStyle.match(/-?[\d\.]+/g);
    var xds = Math.abs(values[4]);
    if (e == 0) {
      translateXval = parseInt(xds) - parseInt(itemWidth * s);
      $(el + " " + rightBtn).removeClass("over");

      if (translateXval <= itemWidth / 2) {
        translateXval = -1 * initialOffset;
        $(el + " " + leftBtn).addClass("over");
      }
    } else if (e == 1) {
      var itemsCondition = $(el).find(itemsDiv).width() - $(el).width();
      translateXval = parseInt(xds) + parseInt(itemWidth * s);
      $(el + " " + leftBtn).removeClass("over");

      if (translateXval >= itemsCondition - itemWidth / 2) {
        translateXval = itemsCondition + initialOffset;
        $(el + " " + rightBtn).addClass("over");
      }
    }
    $(el + " " + itemsDiv).css("transform", "translateX(" + -translateXval + "px)");
  }

  //It is used to get some elements from btn
  function click(ell, ee) {
    var Parent = "#" + $(ee).parent().attr("id");
    var slide = $(Parent).attr("data-slide");
    ResCarousel(ell, Parent, slide);
  }

  $(".scoreboard-carousel-item.w3-hide").each(function (ind, obj) {
    $(obj).removeClass("w3-hide");
  });
};

const tier_placement = (tiers, population_size, distribution, rank_place) => {
  console.log({
    tiers: tiers,
    population_size: population_size,
    distribution: distribution,
    rank_place: rank_place,
  });
  Array(tiers)
    .fill(1)
    .map((x, y) => x + y);
  var tier_dict = {};
  for (var i = 1; i <= tiers; i++) {
    tier_dict[i] = {
      start: null,
      stop: null,
      segment_size: 0,
      segment_ratio: 0,
      population_count: 0,
    };
  }

  var middle_tier = Math.floor(tiers / 2) + 1;
  var total_segment_size = 0;

  var previous_stop = 0;
  var placement = 0;

  if (distribution == "Normal") {
    for (var tier in tier_dict) {
      var tier_obj = tier_dict[tier];
      tier_obj.segment_size = middle_tier - Math.abs(middle_tier - tier);
      total_segment_size += tier_obj.segment_size;
    }
  } else if (distirbution == "Uniform") {
    console.log("tier", tier);
  }

  for (var tier in tier_dict) {
    var tier_obj = tier_dict[tier];
    tier_obj.segment_ratio = tier_obj.segment_size / total_segment_size;
    tier_obj.population_count = Math.ceil(tier_obj.segment_ratio * population_size);

    tier_obj.start = previous_stop + 1;
    tier_obj.stop = tier_obj.start + tier_obj.population_count;
    previous_stop = tier_obj.stop;

    if (rank_place >= tier_obj.start && rank_place <= tier_obj.stop) {
      placement = tier;
    }
  }

  console.log({ placement: placement });

  return placement;
};

const geo_marker_action = async (common) => {
  console.log("Adding geo_marker_action");
  const ddb = common.ddb;
  $(".geo-marker").on("click", async function () {
    let city = $(this).attr("city");
    let state = $(this).attr("state");

    let location = ddb.cities.findOne({ city: city, state: state });
    console.log({
      common: common,
      this: $(this),
      t: this,
      location:location
    });

    let modal_config = common.page;

    if (!modal_config) {
      modal_config = {
        PrimaryColor: $(this).closest("tr").attr("primary-color"),
        SecondaryColor: $(this).closest("tr").attr("secondary-color"),
      };
    }

    const icon = L.divIcon({
      html: `<i class="fa fa-map-marker-alt" style="font-size: 40px; color: ${modal_config.PrimaryColor};"></i>`,
      iconSize: [40, 40],
      iconAnchor: [15, 40],
    });

    var modal_url = "/html_templates/common_templates/geography_modal_template.njk";
    var html = await fetch(modal_url);
    html = await html.text();
    var renderedHtml = nunjucks_env.renderString(html, {
      page: modal_config,
      location: location,
    });
    console.log({ renderedHtml: renderedHtml });
    $("#geography-modal").html(renderedHtml);
    $("#geography-modal").addClass("shown");

    let map = L.map("map-body").setView([location.lat, location.long], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    L.marker([location.lat, location.long], { icon: icon }).addTo(map);

    $(window).on("click", async function (event) {
      if ($(event.target)[0] == $("#geography-modal")[0]) {
        $("#geography-modal").removeClass("shown");
        $(window).unbind();
        await player_face_listeners(common);
      }
    });
  });
};

const update_create_world_modal = async (completed_stage_id, started_stage_id) => {
  $("#" + completed_stage_id).html(
    '<i class="fa fa-check-circle" style="color:green; font-size: 20px;"></i>'
  );
  $("#" + started_stage_id).html(
    '<div class="spinner-border spinner-border-sm" role="status"></div>'
  );
};

const new_world_action = async (common, database_suffix) => {
  $(".conference-select-table").addClass("w3-hide");
  $(".create-progress-table").removeClass("w3-hide");

  await update_create_world_modal(null, "create-world-table-new-world");

  const new_db = await create_new_db();

  const db = await new_db["db"];

  const new_season_info = new_db["new_season_info"];

  const world_id = new_season_info.world_id;
  const season = new_season_info.current_season;

  common.db = db;
  common.season = season;

  var teams_from_json = await get_teams();

  var conferences_from_json = await get_conferences(database_suffix);
  console.log({ conferences_from_json: conferences_from_json });

  var school_names_to_include = [];
  const conference_name_by_school_name = {};

  let conferences_to_save = [];
  $.each(conferences_from_json, function (ind, conf_data) {
    conf_data.world_id = world_id;
    conf_data.conference_id = ind + 1;

    let school_names = conf_data.divisions.map((d) => d.teams);
    school_names = school_names.flat();
    school_names_to_include = school_names_to_include.concat(school_names);

    for (var school_name of school_names) {
      conference_name_by_school_name[school_name] = conf_data.conference_name;
    }

    conferences_to_save.push(new conference(conf_data));
  });

  console.log("adding", { db: db, "db.conference": db.conference, conferences_to_save });
  db.conference.insert(conferences_to_save);
  await db.saveDatabaseAsync();

  var conferences = db.conference.find();

  teams_from_json = teams_from_json.filter((t) => school_names_to_include.includes(t.school_name));
  const num_teams = teams_from_json.length;

  const season_data = {
    season: season,
    world_id: world_id,
    captains_per_team: 3,
    players_per_team: 70,
    num_teams: num_teams,
  };
  const new_season = new league_season(season_data, undefined);
  console.log({ new_season: new_season });
  db.league_season.insert(new_season);
  await db.saveDatabaseAsync();


  console.log({ season: season, common: common, db: db, new_season_info: new_season_info });
  const phases_created = await create_phase(season, common);
  await create_week(phases_created, common, world_id, season);

  const rivalries = await get_rivalries(teams_from_json);

  await create_conference_seasons({
    common: common,
    conferences: conferences,
    season: season,
    world_id: world_id,
  });
  var conference_seasons = index_group_sync(db.conference_season.find(), "index", "conference_id");

  conferences = nest_children(
    conferences,
    conference_seasons,
    "conference_id",
    "conference_season"
  );
  const conferences_by_conference_name = index_group_sync(conferences, "index", "conference_name");
  const conferences_by_school_name = {};

  console.log({
    conference_name_by_school_name: conference_name_by_school_name,
  });

  for (let [school_name, conference_name] of Object.entries(conference_name_by_school_name)) {
    conferences_by_school_name[school_name] =
      conferences_by_conference_name[conference_name_by_school_name[school_name]];
    console.log({
      school_name: school_name,
      conference_name: conference_name,
    });
  }

  console.log({
    conferences_by_school_name: conferences_by_school_name,
    conference_name_by_school_name: conference_name_by_school_name,
    conferences_by_conference_name: conferences_by_conference_name,
  });

  var teams = [],
    rivals = [],
    rivals_team_1 = [],
    rivals_team_2 = [];
  const jersey_options = [
    "football-standard",
    "football-ponies",
    "football-sparta",
    "football-three-stripe",
    "football-two-stripe",
  ];

  let cities = ddb.cities.find();
  console.log({ cities: cities });
  let cities_by_city_state = index_group_sync(cities, "index", "city_state");

  teams_from_json = teams_from_json.sort((t_a, t_b) =>
    t_a.school_name > t_b.school_name ? 1 : -1
  );

  var team_id_counter = 1;
  for (let t of teams_from_json) {
    if (t.jersey.invert) {
      t.jersey.teamColors = [
        "#FFFFFF",
        `#${team.team_color_primary_hex}`,
        `#${team.team_color_secondary_hex}`,
      ];
    } else if (t.jersey.flip_primaries) {
      t.jersey.teamColors = [
        `#${t.team_color_secondary_hex}`,
        `#${t.team_color_primary_hex}`,
        "#FFFFFF",
      ];
    } else {
      t.jersey.teamColors = [
        `#${t.team_color_primary_hex}`,
        `#${t.team_color_secondary_hex}`,
        "#FFFFFF",
      ];
    }

    if (t.jersey.lettering) {
      t.jersey.lettering_color = t.jersey.lettering_color || "FFFFFF";
    }

    t.jersey.id = t.jersey.id || jersey_options[Math.floor(Math.random() * jersey_options.length)];

    rivals_team_1 = rivalries
      .filter((r) => r.team_name_1 == t.school_name)
      .map(function (r) {
        return {
          opponent_name: r.team_name_2,
          opponent_team_id: null,
          preferred_week_number: r.preferred_week_number,
          rivalry_name: r.rivalry_name,
        };
      });
    rivals_team_2 = rivalries
      .filter((r) => r.team_name_2 == t.school_name)
      .map(function (r) {
        return {
          opponent_name: r.team_name_1,
          opponent_team_id: null,
          preferred_week_number: r.preferred_week_number,
          rivalry_name: r.rivalry_name,
        };
      });

    rivals = rivals_team_1.concat(rivals_team_2);

    console.log({
      conferences_by_school_name: conferences_by_school_name,
      t: t,
    });

    t.location.lat = cities_by_city_state[t.location.city + ", " + t.location.state].lat;
    t.location.long = cities_by_city_state[t.location.city + ", " + t.location.state].long;

    teams.push(
      new team({
        team_id: team_id_counter,
        school_name: t.school_name,
        team_name: t.team_name,
        world_id: world_id,
        team_logo_url: t.team_logo_url,
        team_abbreviation: t.team_abbreviation,
        team_color_primary_hex: t.team_color_primary_hex,
        team_color_secondary_hex: t.team_color_secondary_hex,
        rivals: rivals,
        jersey: t.jersey,
        field: t.field,
        team_ratings: t.team_ratings,
        location: t.location,
        starting_tendencies: t.starting_tendencies,
        conference: {
          conference_id: conferences_by_school_name[t.school_name].conference_id,
          conference_name: conferences_by_school_name[t.school_name].conference_name,
        },
      })
    );

    team_id_counter += 1;
  }

  teams.push(
    new team({
      team_id: -1,
      school_name: "Available",
      team_name: "Players",
      world_id: world_id,
      team_abbreviation: "AVAIL",
      team_color_primary_hex: "1763B2",
      team_color_secondary_hex: "FFFFFF",
      rivals: [],
      jersey: {
        invert: false,
        id: "football-standard",
        teamColors: ["#1763B2", "#000000", "#FFFFFF"],
      },
      team_ratings: {},
      location: {
        city: "Washington",
        state: "DC",
      },
      conference: {},
    })
  );

  teams.push(
    new team({
      team_id: -2,
      school_name: season,
      team_name: "Recruits",
      world_id: world_id,
      team_abbreviation: "RECRUIT",
      team_color_primary_hex: "1763B2",
      team_color_secondary_hex: "FFFFFF",
      rivals: [],
      jersey: {
        invert: false,
        id: "football-standard",
        teamColors: ["#1763B2", "#000000", "#FFFFFF"],
      },
      team_ratings: {},
      location: {
        city: "Washington",
        state: "DC",
      },
      conference: {},
    })
  );

  const teams_by_team_name = index_group_sync(teams, "index", "school_name");

  console.log({ teams: teams });

  let city_names = {};
  $.each(teams, function (ind, team) {
    $.each(team.rivals, function (ind, rival) {
      rival.opponent_team_id = teams_by_team_name[rival.opponent_name].team_id;
    });

    city_names[team.location.city] = (city_names[team.location.city] || 0) + 1;
  });

  for (let team of teams) {
    team.location.unique_city_name = city_names[team.location.city] == 1;
  }

  console.log({ teams: teams, city_names: city_names });
  db.team.insert(teams);
  await db.saveDatabaseAsync();


  await update_create_world_modal(
    "create-world-table-new-world",
    "create-world-table-create-teams"
  );

  await create_team_season({
    common: common,
    season: season,
    world_id: world_id,
    conferences_by_conference_name: conferences_by_conference_name,
  });

  var team_seasons = db.team_season.find({ season: season, team_id: { $gt: 0 } });

  teams = db.team.find({ team_id: { $gt: 0 } });
  // teams.forEach(t => delete t.starting_tendencies);
  // await db.team.update(teams);

  const teams_by_team_id = index_group_sync(teams, "index", "team_id");

  await update_create_world_modal(
    "create-world-table-create-teams",
    "create-world-table-create-coaches"
  );

  await create_coaches({
    common: common,
    team_seasons: team_seasons,
    teams_by_team_id: teams_by_team_id,
    world_id: world_id,
    season: season,
  });

  await update_create_world_modal(
    "create-world-table-create-coaches",
    "create-world-table-assign-coaches"
  );

  var coaches = db.coach.find();
  await create_coach_team_seasons({
    common: common,
    coaches: coaches,
    world_id: world_id,
    team_seasons: team_seasons,
    season: season,
  });

  await update_create_world_modal(
    "create-world-table-assign-coaches",
    "create-world-table-create-players"
  );

  await create_new_players_and_player_team_seasons(common, world_id, season, team_seasons, [
    "HS SR",
    "FR",
    "SO",
    "JR",
    "SR",
  ]);

  await update_create_world_modal(
    "create-world-table-create-players",
    "create-world-table-player-ratings"
  );

  await generate_player_ratings(common, world_id, season);

  await update_create_world_modal(
    "create-world-table-player-ratings",
    "create-world-table-assign-players"
  );

  await assign_players_to_teams(common, world_id, season, team_seasons);

  await assign_player_jersey_numbers(common, season);

  await update_create_world_modal(
    "create-world-table-assign-players",
    "create-world-table-depth-charts"
  );
  await populate_all_depth_charts(common);

  await update_create_world_modal(
    "create-world-table-depth-charts",
    "create-world-table-team-talent"
  );
  await calculate_team_overalls(common);

  await update_create_world_modal(
    "create-world-table-team-talent",
    "create-world-table-recruiting-class"
  );
  await calculate_team_needs(common);
  await create_recruiting_class(common);

  await update_create_world_modal(
    "create-world-table-recruiting-class",
    "create-world-table-rankings"
  );
  const all_weeks = db.week.find({ season: season });
  const this_week = all_weeks.filter((w) => w.is_current)[0];

  this_week.phase = db.phase.findOne({ phase_id: this_week.phase_id });
  this_week.phase.season = season;

  console.log("this_week", this_week, all_weeks, common);

  await calculate_national_rankings(this_week, all_weeks, common);
  await calculate_conference_rankings(this_week, all_weeks, common);

  await update_create_world_modal(
    "create-world-table-rankings",
    "create-world-table-create-schedule"
  );
  await create_schedule({
    common: common,
    season: season,
    world_id: world_id,
  });

  await choose_preseason_all_americans(common);

  await update_create_world_modal("create-world-table-create-schedule", null);

  conferences = db.conference.find();
  teams = db.team.find({ team_id: { $gt: 0 } });
  console.log({ teams: teams });
  teams.sort(function (t_a, t_b) {
    if (t_b.conference.conference_name > t_a.conference.conference_name) {
      return -1;
    } else if (t_b.conference.conference_name < t_a.conference.conference_name) {
      return 1;
    } else {
      if (t_b.school_name > t_a.school_name) {
        return -1;
      } else if (t_b.school_name < t_a.school_name) {
        return 1;
      }
    }
    return 0;
  });
  console.log({ teams: teams, "common.nunjucks_env": nunjucks_env });
  var url = "/html_templates/index/index/choose_team_table_template.njk";
  var html = await fetch(url);
  html = await html.text();

  let render_content = {
    teams: teams,
  };

  const renderedHtml = nunjucks_env.renderString(html, render_content);

  $(".choose-team-table").html(renderedHtml);
  $(".create-progress-table").addClass("w3-hide");
  $(".choose-team-table").removeClass("w3-hide");

  geo_marker_action(common);
  init_basic_table_sorting(common, "#choose-team-table", 0);
  $(".modal-dialog").css("max-width", "85%");
  $(".modal-dialog").css("width", "85%");

  console.log({
    db: db,
    ddb: ddb,
    world_id: world_id,
    season: season,
  });
  const current_league_season = db.league_season.findOne({ season: season });
  const world = ddb.world.findOne({ world_id: world_id });
  world.current_league_season = current_league_season;

  $(".choose-team-table button").on("click", async function () {
    let team_id = parseInt($(this).closest("[team-id]").attr("team-id"));
    const user_team = db.team.findOne({ team_id: team_id });

    const user_team_season = db.team_season.findOne({
      team_id: team_id,
      season: current_league_season.season,
    });

    console.log({
      user_team: user_team,
      user_team_season: user_team_season,
      current_league_season: current_league_season,
      team_id: team_id,
      teams: teams,
      c: teams[0].constructor,
      this: $(this),
    });

    current_league_season.user_team_id = team_id;
    user_team_season.is_user_team = true;
    user_team.is_user_team = true;

    world.user_team = {};
    world.user_team.team_name = user_team.team_name;
    world.user_team.school_name = user_team.school_name;
    world.user_team.team_logo_url = user_team.team_logo;
    world.user_team.team_record = "0-0";
    world.user_team.team_id = user_team.team_id;

    ddb.world.update(world);
    db.league_season.update(current_league_season);
    db.team_season.update(user_team_season);
    db.team.update(user_team);

    await db.saveDatabaseAsync();
    await ddb.saveDatabaseAsync();

    await navigate_to_href(`/World/${world_id}`);
  });
};

Array.prototype.add_element_sorted_list = function (elem, compare_func) {
  if (this.length == 0) {
    this.push(elem);
  } else {
    let insert_index = this.findIndex((e) => compare_func(e, elem) >= 0);

    if (insert_index == -1) {
      this.push(elem);
    } else {
      this.splice(insert_index, 0, elem);
    }
  }
};

Array.prototype.top_sort = function (top_n, compare_func) {
  if (this.length == 0) {
    return [];
  }

  let top_list = [];
  this.forEach(function (elem) {
    if (top_list.length < top_n || compare_func(elem, top_list[top_list.length - 1])) {
      top_list.add_element_sorted_list(elem, compare_func);

      if (top_list.length > top_n) {
        top_list.pop();
      }
    }
  });

  return top_list;
};

const navigate_to_href = async (href) => {
  // event.preventDefault();
  window.onbeforeunload = function () {};
  history.pushState({ path: href }, "", href);
  await page(href);
};

$(document).ready(async function () {
  var startTime = performance.now();

  $(document).on("click", async function (event) {
    const target = $(event.target);
    const parent_link = $(target).closest("[href]");
    const href = parent_link.attr("href");

    console.log(event);

    if (href) {
      event.preventDefault();

      await navigate_to_href(href);
    }
  });

  window.onpopstate = async function () {
    await navigate_to_href(location.pathname);
    //await page(location.pathname);
  };

  // await action(common);

  //await page(location.pathname);
  await navigate_to_href(location.pathname);

  var endTime = performance.now();
  console.log(`Time taken to render HTML: ${parseInt(endTime - startTime)} ms`);
});

const page = async (path) => {
  console.log("page", path);
  const common = await common_functions(path);
  var startTime = performance.now();
  common.startTime = startTime;

  console.log({
    common: common,
    winning_route: common.winning_route,
    "common.winning_route.f": common.winning_route.f,
  });

  await common.winning_route.f(common);

  await add_listeners(common);
  var endTime = performance.now();
  console.log(`Time taken to render ${path}: ${parseInt(endTime - startTime)} ms`);
};
