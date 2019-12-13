# Generated by Django 2.2.5 on 2019-12-13 02:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0032_game_nextgameid'),
    ]

    operations = [
        migrations.RenameField(
            model_name='leagueseason',
            old_name='TournamentCreated',
            new_name='BowlsCreated',
        ),
        migrations.AddField(
            model_name='leagueseason',
            name='BowlSelectionDateID',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='BowlSelectionDateID', to='HeadFootballCoach.Calendar'),
        ),
        migrations.AddField(
            model_name='leagueseason',
            name='ConferenceChampionshipsCreated',
            field=models.BooleanField(default=False),
        ),
    ]
