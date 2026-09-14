from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("wellness", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="mindguarduser",
            name="first_name",
            field=models.CharField(blank=True, default="", max_length=60),
        ),
        migrations.AddField(
            model_name="mindguarduser",
            name="last_login_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="mindguarduser",
            name="last_name",
            field=models.CharField(blank=True, default="", max_length=60),
        ),
    ]
