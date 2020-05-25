# Generated by Django 3.0.2 on 2020-05-22 16:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0147_auto_20200519_0252'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='position',
            name='Acceleration_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Agility_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Awareness_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='BallCarrierVision_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='BlockShedding_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='BreakTackle_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Carrying_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='CatchInTraffic_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Catching_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='DeepThrowAccuracy_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Elusiveness_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='HitPower_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='ImpactBlock_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Injury_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='JukeMove_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Jumping_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='KickAccuracy_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='KickPower_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='KickReturn_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='ManCoverage_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='MediumThrowAccuracy_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='PassBlock_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='PassRush_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='PlayAction_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='PlayRecognition_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Press_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Pursuit_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Release_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='RouteRunning_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='RunBlock_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='ShortThrowAccuracy_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Speed_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Stamina_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Strength_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='Tackle_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='ThrowOnRun_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='ThrowPower_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='ThrowUnderPressure_Rating_Base',
        ),
        migrations.RemoveField(
            model_name='position',
            name='ZoneCoverage_Rating_Base',
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Acceleration_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Agility_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Awareness_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='BallCarrierVision_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='BlockShedding_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='BreakTackle_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Carrying_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='CatchInTraffic_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Catching_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='DeepThrowAccuracy_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Elusiveness_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='HitPower_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='ImpactBlock_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Injury_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='JukeMove_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Jumping_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='KickAccuracy_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='KickPower_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='KickReturn_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='ManCoverage_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='MediumThrowAccuracy_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='PassBlock_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='PassRush_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='PlayAction_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='PlayRecognition_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Press_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Pursuit_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Release_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='RouteRunning_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='RunBlock_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='ShortThrowAccuracy_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Speed_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Stamina_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Strength_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='Tackle_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='ThrowOnRun_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='ThrowPower_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='ThrowUnderPressure_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='system_playerarchetyperatingmodifier',
            name='ZoneCoverage_Rating_Base',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
    ]