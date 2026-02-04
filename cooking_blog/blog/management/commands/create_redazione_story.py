"""
Management command to create a story about the Redazione.
Run with: python manage.py create_redazione_story
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from blog.models import StoryPost

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a story post about the Redazione'

    def handle(self, *args, **options):
        # Find or get the redazione user
        redazione_user = User.objects.filter(is_redazione=True).first()
        
        if not redazione_user:
            self.stdout.write(
                self.style.WARNING('No redazione user found. Creating one...')
            )
            # Create a redazione user if it doesn't exist
            redazione_user = User.objects.create_user(
                email='redazione@sardegnaricette.it',
                name='Redazione',
                is_redazione=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created redazione user: {redazione_user.email}')
            )
        
        # Check if story already exists
        existing_story = StoryPost.objects.filter(
            author=redazione_user,
            title__icontains='redazione'
        ).first()
        
        if existing_story:
            self.stdout.write(
                self.style.WARNING(f'Story already exists: {existing_story.title}')
            )
            self.stdout.write('Updating existing story...')
            existing_story.content = self.get_story_content()
            existing_story.role = 'Redazione'
            existing_story.is_published = True
            existing_story.save()
            self.stdout.write(
                self.style.SUCCESS(f'Updated story: {existing_story.title}')
            )
            return
        
        # Create the story
        story = StoryPost.objects.create(
            title='La Nostra Missione: Custodire le Ricette Tradizionali Sarde',
            content=self.get_story_content(),
            author=redazione_user,
            role='Redazione',
            is_published=True
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created story: {story.title}')
        )
    
    def get_story_content(self):
        return """Benvenuti su Sardegna Ricette e non solo. Siamo la Redazione, un gruppo di appassionati di cucina tradizionale sarda dedicato a preservare e condividere le ricette autentiche della nostra amata isola.

La nostra missione nasce da una profonda consapevolezza: le ricette tradizionali sarde rappresentano un patrimonio culturale inestimabile, tramandato di generazione in generazione attraverso la tradizione orale e la pratica quotidiana. Ogni piatto racconta una storia, ogni ingrediente porta con sé il sapore della terra sarda, ogni ricetta è un ponte tra passato e presente.

In un'epoca in cui la globalizzazione rischia di omogeneizzare le culture culinarie, riteniamo fondamentale mantenere vive queste tradizioni. Le nostre nonne e bisnonne ci hanno insegnato che cucinare è molto più che preparare un pasto: è un atto d'amore, un modo per mantenere viva la memoria collettiva, un gesto che unisce le famiglie intorno al tavolo.

Attraverso questo spazio, ci impegniamo a:

• **Documentare** le ricette tradizionali sarde nella loro forma più autentica, rispettando gli ingredienti e le tecniche originali
• **Condividere** le storie che accompagnano ogni piatto, perché ogni ricetta ha una storia da raccontare
• **Preservare** un patrimonio culinario che rischia di essere dimenticato, assicurandoci che le future generazioni possano continuare a gustare e apprezzare questi sapori
• **Coltivare** la passione per la cucina tradizionale, dimostrando che le ricette di una volta possono essere rilevanti e apprezzate anche oggi

Ogni ricetta che pubblichiamo è stata accuratamente selezionata e testata. Ci impegniamo a mantenere l'autenticità dei sapori originali, utilizzando ingredienti locali quando possibile e rispettando le tecniche tradizionali di preparazione.

La tradizione non è qualcosa di statico da conservare in un museo, ma un patrimonio vivo che si evolve mantenendo la sua essenza. Per questo motivo, mentre rispettiamo rigorosamente le ricette originali, siamo anche aperti a condividere varianti e adattamenti che rispettano lo spirito della tradizione sarda.

Il nostro obiettivo è creare una comunità di appassionati che condividano la stessa passione per la cucina tradizionale sarda. Ogni ricetta che pubblichiamo è un invito a riscoprire i sapori autentici della Sardegna, a riunire le famiglie intorno al tavolo, a creare nuovi ricordi mantenendo vivi quelli del passato.

Grazie per essere parte di questo viaggio culinario insieme a noi. Buon appetito e buona tradizione!

— La Redazione di Sardegna Ricette e non solo"""
