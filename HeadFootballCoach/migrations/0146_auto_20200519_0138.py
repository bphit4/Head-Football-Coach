# Generated by Django 3.0.2 on 2020-05-19 01:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HeadFootballCoach', '0145_system_playerarchetyperatingmodifier_positionid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teamseason',
            name='ScholarshipsToOffer',
            field=models.SmallIntegerField(default=0),
        ),
    ]