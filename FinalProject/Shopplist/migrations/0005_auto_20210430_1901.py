# Generated by Django 3.1.6 on 2021-04-30 23:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Shopplist', '0004_auto_20210430_1846'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='category',
            field=models.ForeignKey(blank=True, default=1, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='items', to='Shopplist.category'),
        ),
    ]
