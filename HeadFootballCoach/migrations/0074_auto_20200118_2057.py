# Generated by Django 3.0.2 on 2020-01-18 20:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0073_auto_20200112_2320'),
    ]

    operations = [
        migrations.CreateModel(
            name='DrivePlay',
            fields=[
                ('PlayChoiceLogID', models.AutoField(primary_key=True, serialize=False)),
                ('BallSpot', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('YardsToGo', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('Down', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('OffensivePointDifferential', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('Period', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('SecondsLeftInPeriod', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('Run_Prob', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('Pass_Prob', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('Punt_Prob', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('FG_Prob', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('PlayClockUrgency', models.SmallIntegerField(blank=True, default=None, null=True)),
                ('PlayChoice', models.CharField(blank=True, default=None, max_length=10, null=True)),
                ('GameDriveID', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.Game')),
                ('WorldID', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.World')),
            ],
        ),
        migrations.CreateModel(
            name='GameDrive',
            fields=[
                ('GameDriveID', models.AutoField(primary_key=True, serialize=False)),
                ('GameID', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.Game')),
                ('WorldID', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.World')),
            ],
        ),
        migrations.DeleteModel(
            name='PlayChoiceLog',
        ),
    ]