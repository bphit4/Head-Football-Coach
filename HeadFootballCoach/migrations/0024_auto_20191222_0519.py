# Generated by Django 2.2.5 on 2019-12-22 05:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0023_auto_20191222_0516'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='teamgame',
            name='TeamSeasonDateRankID',
        ),
        migrations.AddField(
            model_name='teamgame',
            name='TeamSeasonWeekRankID',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.TeamSeasonWeekRank'),
        ),
    ]
