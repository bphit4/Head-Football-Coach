# Generated by Django 3.0.2 on 2020-04-07 21:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0090_teamgame_biggestlead'),
    ]

    operations = [
        migrations.AddField(
            model_name='teamgame',
            name='OpposingTeamGameID',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='opposingteamgame_game', to='HeadFootballCoach.TeamGame'),
        ),
        migrations.AlterField(
            model_name='teamgame',
            name='OpposingTeamSeasonID',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='teamseason_opposingteamgame', to='HeadFootballCoach.TeamSeason'),
        ),
    ]