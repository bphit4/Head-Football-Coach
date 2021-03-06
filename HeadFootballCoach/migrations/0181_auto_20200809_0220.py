# Generated by Django 3.0.7 on 2020-08-09 02:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0180_recruitteamseason_teamseasonstateid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recruitteamseason',
            name='ScoutingFuzz',
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Acceleration_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Agility_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Awareness_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_BallCarrierVision_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_BlockShedding_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_BreakTackle_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Carrying_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_CatchInTraffic_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Catching_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_DeepThrowAccuracy_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Elusiveness_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_HitPower_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_ImpactBlock_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Injury_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_JukeMove_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Jumping_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_KickAccuracy_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_KickPower_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_KickReturn_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_ManCoverage_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_MediumThrowAccuracy_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Overall_Original',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_PassBlock_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_PassRush_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_PlayAction_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_PlayRecognition_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Press_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Pursuit_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Release_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_RouteRunning_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_RunBlock_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_ShortThrowAccuracy_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Speed_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Stamina_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Strength_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_Tackle_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_ThrowOnRun_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_ThrowPower_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_ThrowUnderPressure_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouted_ZoneCoverage_Rating_Original',
            field=models.PositiveSmallIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Athleticism_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Athleticism_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Athleticism_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Blocking_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Blocking_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Blocking_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Coverage_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Coverage_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Coverage_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_DLine_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_DLine_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_DLine_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_GeneralDefense_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_GeneralDefense_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_GeneralDefense_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Intangibles_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Intangibles_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Intangibles_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Kicking_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Kicking_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Kicking_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_PassingIntangibles_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_PassingIntangibles_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_PassingIntangibles_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Receiving_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Receiving_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Receiving_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Rushing_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Rushing_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_Rushing_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_ThrowingArm_Accuracy',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_ThrowingArm_Precision',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseason',
            name='Scouting_ThrowingArm_ScoutingPercent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='recruitteamseasoninterest',
            name='InterestEarnedThisWeek',
            field=models.IntegerField(default=0),
        ),
    ]