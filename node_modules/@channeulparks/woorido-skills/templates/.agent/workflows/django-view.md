---
description: Create Django REST Framework ViewSet and Serializer
---

# /django-view [ResourceName]

<!-- Django REST Framework ViewSet 및 Serializer 생성 -->

## Usage
```
/django-view Recommendation
/django-view Search --elasticsearch
/django-view Analytics --readonly
```

## Steps

// turbo
1. Create Serializer `[app]/serializers.py`:

```python
# serializers.py
from rest_framework import serializers
from .models import [Resource]


class [Resource]Serializer(serializers.ModelSerializer):
    """
    [Resource] 모델 시리얼라이저
    """
    class Meta:
        model = [Resource]
        fields = ['id', 'title', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class [Resource]DetailSerializer([Resource]Serializer):
    """
    상세 조회용 시리얼라이저 (관계 포함)
    """
    # related_items = RelatedSerializer(many=True, read_only=True)
    
    class Meta([Resource]Serializer.Meta):
        fields = [Resource]Serializer.Meta.fields + ['related_items']
```

// turbo
2. Create ViewSet `[app]/views.py`:

```python
# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import [Resource]
from .serializers import [Resource]Serializer, [Resource]DetailSerializer


class [Resource]ViewSet(viewsets.ModelViewSet):
    """
    [Resource] CRUD API
    """
    queryset = [Resource].objects.all()
    serializer_class = [Resource]Serializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return [Resource]DetailSerializer
        return [Resource]Serializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # 필터링
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        통계 API
        """
        total = self.get_queryset().count()
        return Response({'total': total})
    
    @action(detail=True, methods=['post'])
    def custom_action(self, request, pk=None):
        """
        커스텀 액션 예시
        """
        instance = self.get_object()
        # 로직 수행
        return Response({'status': 'success'})
```

// turbo
3. Register URL `[app]/urls.py`:

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import [Resource]ViewSet

router = DefaultRouter()
router.register(r'[resources]', [Resource]ViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

## Elasticsearch Integration (--elasticsearch flag)

```python
# search/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch import Elasticsearch

es = Elasticsearch(['http://elasticsearch:9200'])


class [Resource]SearchView(APIView):
    """
    Elasticsearch 기반 검색 API
    """
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'results': []})
        
        # Elasticsearch 쿼리
        search_body = {
            'query': {
                'multi_match': {
                    'query': query,
                    'fields': ['title^3', 'description'],
                    'analyzer': 'korean'
                }
            },
            'size': 20
        }
        
        result = es.search(index='[resources]', body=search_body)
        
        hits = [
            {
                'id': hit['_id'],
                'score': hit['_score'],
                **hit['_source']
            }
            for hit in result['hits']['hits']
        ]
        
        return Response({
            'total': result['hits']['total']['value'],
            'results': hits
        })
```

## Django Model Pattern

```python
# models.py
from django.db import models
import uuid


class [Resource](models.Model):
    """
    [Resource] 모델 - Spring Boot에서 동기화됨
    """
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='ACTIVE')
    synced_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sync_[resources]'
        ordering = ['-created_at']
```
