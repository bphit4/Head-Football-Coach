from django.contrib import admin

from .models import Audit, System_PlayerArchetypeRatingModifier,PlayerTeamSeasonAward,TeamRivalry, TeamGame, GameStructure, TournamentRegion, TournamentRound, System_TournamentRound, System_TournamentGame,TeamSeasonDateRank, User,World,Region, Nation, State, City, NameList,League, Headline,Tournament, TeamSeason, RecruitTeamSeason, Coach, CoachTeamSeason, Team, Player, Game,PlayerTeamSeason, Conference, TeamConference, LeagueSeason, Calendar, GameEvent, PlayerSeasonSkill,Driver, PlayerGameStat
# Register your models here.
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from django.utils.html import format_html
from django.urls import reverse


class RegionAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Region._meta.get_fields() if field.name not in ('tournament', 'nation','playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason') ]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class NationAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Nation._meta.get_fields() if field.name not in ('tournament', 'state','playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason') ]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class StateAdmin(admin.ModelAdmin):
    list_display = [field.name for field in State._meta.get_fields() if field.name not in ('tournament', 'city', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class CityAdmin(admin.ModelAdmin):
    list_display = [field.name for field in City._meta.get_fields() if field.name not in ('tournament','player', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class NameListAdmin(admin.ModelAdmin):
    list_display = [field.name for field in NameList._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class CalendarAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Calendar._meta.get_fields() if field.name not in ('tournament','headline', 'game', 'teamseasondaterank', 'driver', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class HeadlineAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Headline._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class LeagueAdmin(admin.ModelAdmin):
    list_display = [field.name for field in League._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('PlayerFirstName', 'PlayerLastName', 'Position', 'Class', 'IsRecruit','PlayerID', 'OverallRating', 'CurrentTeam', 'PassingRating', 'DribblingRating', 'CityID')

class GameStructureAdmin(admin.ModelAdmin):
    list_display = [field.name for field in GameStructure._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'league', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('PlayerFirstName', 'PlayerLastName', 'Position', 'Class', 'IsRecruit','PlayerID', 'OverallRating', 'CurrentTeam', 'PassingRating', 'DribblingRating', 'CityID')

class PlayerAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Player._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'playerseasonskill', 'recruitteamseason')]#('PlayerFirstName', 'PlayerLastName', 'Position', 'Class', 'IsRecruit','PlayerID', 'OverallRating', 'CurrentTeam', 'PassingRating', 'DribblingRating', 'CityID')

class CoachAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Coach._meta.get_fields() if field.name not in ['coachteamseason']]


class PlayerSkillAdmin(admin.ModelAdmin):
    list_display = [field.name for field in PlayerSeasonSkill._meta.get_fields()] + ['PopulateOverallRating']#( 'PlayerID', 'OverallRating',  'InsideShootingRating', 'DunkLayupRating', 'ThreePointRating', 'PassingRating', 'DribblingRating')

class RecruitTeamSeasonAdmin(admin.ModelAdmin):
    list_display = [field.name for field in RecruitTeamSeason._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')


class TeamSeasonAdmin(admin.ModelAdmin):
    list_display = [field.name for field in TeamSeason._meta.get_fields() if field.name not in ('teamgame','playerteamseason', 'teamseasondaterank', 'coachteamseason', 'recruitteamseason')] + ['TeamOverallRating']#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')
    #search_fields = ('CoachFirstName', 'CoachLastName', 'CoachID' )



class PlayerGameStatAdmin(admin.ModelAdmin):
    list_display = [field.name for field in PlayerGameStat._meta.get_fields() if field.name not in ('playerteamseason', 'teamseasondaterank', 'coachteamseason', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')


class AuditAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Audit._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')


class GameAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Game._meta.get_fields() if field.name not in ('teamgame','tournament', 'playergamestat','gameevent','playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class GameEventAdmin(admin.ModelAdmin):
    list_display = [field.name for field in GameEvent._meta.get_fields() if field.name not in ('tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

#class PlayerTeamSeasonAdmin(admin.ModelAdmin):
#    list_display = [field.name for field in PlayerTeamSeason._meta.get_fields() if field.name not in ('playergamestat', 'playerteamseasonaward','tournament', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class TeamAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Team._meta.get_fields() if field.name not in ('tournament','teamconference','teamseason','driver',  'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class TeamSeasonDateRankAdmin(admin.ModelAdmin):
    list_display = [field.name for field in TeamSeasonDateRank._meta.get_fields() if field.name not in ('teamgame','tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class TeamGameAdmin(admin.ModelAdmin):
    list_display = [field.name for field in TeamGame._meta.get_fields() if field.name not in ('playergamestat','teamgame','tournament', 'playerteamseason', 'conference', 'leagueseason', 'team', 'playerseasonskill', 'recruitteamseason')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')


class TeamRivalryAdmin(admin.ModelAdmin):
    list_display = [field.name for field in TeamRivalry._meta.get_fields() if field.name not in ('hold')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')

class System_PlayerArchetypeRatingModifierAdmin(admin.ModelAdmin):
    list_display = [field.name for field in System_PlayerArchetypeRatingModifier._meta.get_fields() if field.name not in ('hold')]#('TeamID', 'LeagueSeasonID', 'GamesPlayed', 'Points', 'ThreePM', 'ThreePointPercentage', 'FGA', 'TournamentSeed', 'NationalBroadcast', 'RegionalBroadcast')


admin.site.register(User)
admin.site.register(Team, TeamAdmin)
admin.site.register(World)
admin.site.register(Player, PlayerAdmin)
admin.site.register(Game, GameAdmin)
#admin.site.register(TeamGame)
#admin.site.register(Calendar)
#admin.site.register(PlayerTeamSeason , PlayerTeamAdmin)
admin.site.register(PlayerTeamSeason)#, PlayerTeamSeasonAdmin)
admin.site.register(Conference)
admin.site.register(TeamConference)
admin.site.register(LeagueSeason)
admin.site.register(Headline,HeadlineAdmin)
admin.site.register(Calendar,CalendarAdmin)
admin.site.register(GameEvent, GameEventAdmin)
admin.site.register(PlayerSeasonSkill, PlayerSkillAdmin)
admin.site.register(Driver)
admin.site.register(PlayerGameStat, PlayerGameStatAdmin)
admin.site.register(Coach, CoachAdmin)
admin.site.register(CoachTeamSeason)
admin.site.register(RecruitTeamSeason, RecruitTeamSeasonAdmin)
admin.site.register(TeamSeason, TeamSeasonAdmin)
admin.site.register(Tournament)
admin.site.register(League, LeagueAdmin)
admin.site.register(Region, RegionAdmin)
admin.site.register(Nation, NationAdmin)
admin.site.register(State, StateAdmin)
admin.site.register(City, CityAdmin)
admin.site.register(NameList, NameListAdmin)
admin.site.register(TeamSeasonDateRank, TeamSeasonDateRankAdmin)
admin.site.register(System_TournamentRound)
admin.site.register(System_TournamentGame)
admin.site.register(TournamentRound)
admin.site.register(TournamentRegion)
admin.site.register(PlayerTeamSeasonAward)
admin.site.register(Audit, AuditAdmin)
admin.site.register(GameStructure, GameStructureAdmin)
admin.site.register(TeamGame, TeamGameAdmin)
admin.site.register(TeamRivalry, TeamRivalryAdmin)
admin.site.register(System_PlayerArchetypeRatingModifier, System_PlayerArchetypeRatingModifierAdmin)
