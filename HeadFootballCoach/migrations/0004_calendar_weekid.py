# Generated by Django 2.2.5 on 2019-12-16 17:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0003_week'),
    ]

    operations = [
        migrations.AddField(
            model_name='calendar',
            name='WeekID',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.Week'),
        ),
    ]