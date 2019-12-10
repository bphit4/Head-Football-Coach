# Generated by Django 2.2.5 on 2019-12-08 16:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0024_gameevent_isscoringplay'),
    ]

    operations = [
        migrations.AddField(
            model_name='gameevent',
            name='DriveDescription',
            field=models.CharField(blank=True, default=None, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='gameevent',
            name='PlayDescription',
            field=models.CharField(blank=True, default=None, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='gameevent',
            name='PlayType',
            field=models.CharField(blank=True, default=None, max_length=6, null=True),
        ),
        migrations.AddField(
            model_name='gameevent',
            name='ScoringTeamID',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.Team'),
        ),
    ]
