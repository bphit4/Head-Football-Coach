# Generated by Django 3.0.7 on 2020-11-07 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0183_recruitteamseason_skillgroupslefttoscout'),
    ]

    operations = [
        migrations.AddField(
            model_name='week',
            name='MessagesToViewThisWeek',
            field=models.IntegerField(default=0),
        ),
    ]