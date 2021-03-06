# Generated by Django 3.1.6 on 2021-05-06 17:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Shopplist', '0009_alter_item_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('unit_type', models.CharField(max_length=15)),
            ],
        ),
        migrations.AddField(
            model_name='item',
            name='price',
            field=models.DecimalField(decimal_places=2, default=1.0, max_digits=5),
        ),
        migrations.AlterField(
            model_name='item',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='items', to='Shopplist.category'),
        ),
        migrations.AddField(
            model_name='item',
            name='unit',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='units', to='Shopplist.unit'),
        ),
    ]
