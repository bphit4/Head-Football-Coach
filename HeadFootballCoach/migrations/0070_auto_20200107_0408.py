# Generated by Django 2.2.5 on 2020-01-07 04:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0069_auto_20200105_2357'),
    ]

    operations = [
        migrations.AddField(
            model_name='coach',
            name='IsActiveCoach',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='coach',
            name='CoachAge',
            field=models.PositiveSmallIntegerField(default=20),
        ),
    ]