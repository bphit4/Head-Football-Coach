# Generated by Django 2.2.5 on 2019-12-22 05:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0022_week_broadcastselected'),
    ]

    operations = [
        migrations.RenameField(
            model_name='teamseasonweekrank',
            old_name='DateID',
            new_name='WeekID',
        ),
    ]
