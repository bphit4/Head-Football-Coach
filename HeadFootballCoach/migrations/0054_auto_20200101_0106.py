# Generated by Django 2.2.5 on 2020-01-01 01:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0053_auto_20191231_1957'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='playerteamseason',
            name='BLK_Pancakes',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='BLK_Sacks',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_Deflections',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_INT',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_INTTD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_INTYards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_QBHits',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_Sacks',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_Safeties',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_SoloTackles',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_TD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_Tackles',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='DEF_TacklesForLoss',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='FUM_Forced',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='FUM_Fumbles',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='FUM_Lost',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='FUM_Recovered',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='FUM_ReturnTD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='FUM_ReturnYards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='GameScore',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='GamesPlayed',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='GamesStarted',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGA',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGA29',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGA39',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGA49',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGA50',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGM',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGM29',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGM39',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGM49',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_FGM50',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_Kickoffs',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_Touchbacks',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_XPA',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KCK_XPM',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KR_LNG',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KR_Returns',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KR_TD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='KR_Yards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PAS_Attempts',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PAS_Completions',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PAS_INT',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PAS_SackYards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PAS_Sacks',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PAS_TD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PAS_Yards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PNT_Punts',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PNT_Touchbacks',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PNT_Within20',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PNT_Yards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PR_LNG',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PR_Returns',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PR_TD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PR_Yards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='PlaysOnField',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='REC_Drops',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='REC_LNG',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='REC_Receptions',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='REC_TD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='REC_Targets',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='REC_Yards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='REC_YardsAfterCatch',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='RUS_20',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='RUS_BrokenTackles',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='RUS_Carries',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='RUS_LNG',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='RUS_TD',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='RUS_Yards',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='RUS_YardsAfterContact',
        ),
        migrations.RemoveField(
            model_name='playerteamseason',
            name='TeamGamesPlayed',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='BLK_Pancakes',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='BLK_Sacks',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_Deflections',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_INT',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_INTTD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_INTYards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_QBHits',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_Sacks',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_Safeties',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_SoloTackles',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_TD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_Tackles',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='DEF_TacklesForLoss',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FUM_Forced',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FUM_Fumbles',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FUM_Lost',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FUM_Recovered',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FUM_ReturnTD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FUM_ReturnYards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FirstDowns',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FourthDownAttempt',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='FourthDownConversion',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGA',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGA29',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGA39',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGA49',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGA50',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGM',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGM29',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGM39',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGM49',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_FGM50',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_Kickoffs',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_Touchbacks',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_XPA',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KCK_XPM',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KR_LNG',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KR_Returns',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KR_TD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='KR_Yards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PAS_Attempts',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PAS_Completions',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PAS_INT',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PAS_SackYards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PAS_Sacks',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PAS_TD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PAS_Yards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PNT_Punts',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PNT_Touchbacks',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PNT_Within20',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PNT_Yards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PR_LNG',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PR_Returns',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PR_TD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PR_Yards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='Points',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='PointsAllowed',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='Possessions',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='REC_Drops',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='REC_LNG',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='REC_Receptions',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='REC_TD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='REC_Targets',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='REC_Yards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='REC_YardsAfterCatch',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='RUS_20',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='RUS_BrokenTackles',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='RUS_Carries',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='RUS_LNG',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='RUS_TD',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='RUS_Yards',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='RUS_YardsAfterContact',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='ThirdDownAttempt',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='ThirdDownConversion',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='TimeOfPossession',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='Turnovers',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='TwoPointAttempt',
        ),
        migrations.RemoveField(
            model_name='teamseason',
            name='TwoPointConversion',
        ),
        migrations.AddField(
            model_name='teamgame',
            name='GamesPlayed',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
    ]