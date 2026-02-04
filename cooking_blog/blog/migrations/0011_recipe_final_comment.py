from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0010_recipe_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='final_comment',
            field=models.TextField(
                blank=True,
                null=True,
                help_text="Commenti finali dell'autore da mostrare in fondo alla ricetta."
            ),
        ),
    ]

