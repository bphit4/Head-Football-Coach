# Generated by Django 3.0.2 on 2020-04-20 01:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0107_auto_20200420_0112'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='coach',
            name='CoveragePressStrategy',
        ),
        migrations.RemoveField(
            model_name='teamseasonstrategy',
            name='CoveragePressStrategy',
        ),
    ]
