# Generated by Django 3.0.2 on 2020-04-13 20:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0098_subposition_positiontypicalstartercountperteam'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerteamseasondepthchart',
            name='DepthPositionPlaysOnField',
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]