# Generated by Django 2.2.5 on 2019-12-26 21:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0036_auto_20191224_1815'),
    ]

    operations = [
        migrations.AddField(
            model_name='playergamestat',
            name='GamesPlayed',
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]