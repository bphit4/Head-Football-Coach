# Generated by Django 2.2.5 on 2019-12-19 15:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0012_playerteamseasonaward_weekid'),
    ]

    operations = [
        migrations.AddField(
            model_name='conference',
            name='ConferenceLogoURL',
            field=models.CharField(blank=True, default=None, max_length=99, null=True),
        ),
    ]