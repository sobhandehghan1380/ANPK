from django.core.management.base import BaseCommand
from django.utils import timezone
from blog.models import Article


class Command(BaseCommand):
    help = 'Publish scheduled articles whose published_at date has passed'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # Find articles that are scheduled and ready to be published
        scheduled_articles = Article.objects.filter(
            status='DRAFT',
            published_at__isnull=False,
            published_at__lte=now
        )
        
        count = 0
        for article in scheduled_articles:
            article.status = 'PUBLISHED'
            article.save()
            count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Published: "{article.title}" (ID: {article.id})')
            )
        
        if count == 0:
            self.stdout.write(self.style.WARNING('No scheduled articles ready for publication.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\nTotal {count} article(s) published successfully.'))
