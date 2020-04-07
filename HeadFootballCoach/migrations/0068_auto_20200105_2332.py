# Generated by Django 2.2.5 on 2020-01-05 23:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0067_auto_20200105_2321'),
    ]

    operations = [
        migrations.AddField(
            model_name='coachposition',
            name='IsCoordinator',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='coachposition',
            name='IsHeadCoach',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='coachposition',
            name='IsPositionCoach',
            field=models.BooleanField(default=False),
        ),
    ]