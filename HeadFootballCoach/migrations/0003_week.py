# Generated by Django 2.2.5 on 2019-12-16 17:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0002_game_teamrivalryid'),
    ]

    operations = [
        migrations.CreateModel(
            name='Week',
            fields=[
                ('WeekID', models.AutoField(primary_key=True, serialize=False)),
                ('WeekNumber', models.PositiveSmallIntegerField(default=0)),
                ('WorldID', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='HeadFootballCoach.World')),
            ],
        ),
    ]