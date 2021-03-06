# Generated by Django 3.0.7 on 2020-07-07 19:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0175_recruitteamseasonpromise'),
    ]

    operations = [
        migrations.AddField(
            model_name='recruitteamseasonpromise',
            name='PromiseOutcomeDetermined',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='recruitteamseasonpromise',
            name='TimeSpanYears',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='recruitteamseasonpromise',
            name='TimespanInclusive',
            field=models.BooleanField(default=True),
        ),
    ]