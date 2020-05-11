# Generated by Django 3.0.2 on 2020-04-24 13:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0114_auto_20200424_0407'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Acceleration_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Agility_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Awareness_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='BallCarrierVision_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='BlockShedding_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='BreakTackle_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Carrying_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='CatchInTraffic_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Catching_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='DeepThrowAccuracy_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Elusiveness_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='HitPower_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='ImpactBlock_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Injury_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='JukeMove_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Jumping_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='KickAccuracy_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='KickPower_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='KickReturn_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='ManCoverage_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='MediumThrowAccuracy_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='PassBlock_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='PassRush_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='PlayAction_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='PlayRecognition_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Press_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Pursuit_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Release_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='RouteRunning_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='RunBlock_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='ShortThrowAccuracy_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Speed_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Stamina_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Strength_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Tackle_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='ThrowOnRun_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='ThrowPower_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='ThrowUnderPressure_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='Total_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='teamseasonposition',
            name='ZoneCoverage_Rating_Weight',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
    ]