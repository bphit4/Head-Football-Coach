# Generated by Django 3.0.2 on 2020-05-14 22:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0134_auto_20200514_1537'),
    ]

    operations = [
        migrations.AddField(
            model_name='week',
            name='RecruitingWeekModifier',
            field=models.FloatField(default=1.0),
        ),
    ]