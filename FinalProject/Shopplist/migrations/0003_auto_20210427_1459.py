# Generated by Django 3.1.6 on 2021-04-27 18:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Shopplist', '0002_category_item_shoplist'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='shoplist',
            options={'verbose_name_plural': 'Shopping Lists'},
        ),
        migrations.AddField(
            model_name='category',
            name='creator',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='Shopplist.user'),
            preserve_default=False,
        ),
    ]
