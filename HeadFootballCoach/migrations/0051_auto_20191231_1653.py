# Generated by Django 2.2.5 on 2019-12-31 16:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0050_auto_20191230_2317'),
    ]

    operations = [
        migrations.AddField(
            model_name='playergamestat',
            name='PlaysOnField',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='playerteamseason',
            name='PlaysOnField',
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]