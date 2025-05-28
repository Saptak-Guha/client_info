from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from bson.objectid import ObjectId
from .models import Client, Product
from .serializers import ClientSerializer
from django.shortcuts import render, redirect
from .serializers import ProductSerializer
def add_product_page(request):
    return render(request, 'add_products.html') 


def update(request):
    return render(request, 'update.html')

@api_view(['POST'])
def client_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"success": "false", "error": "Dogesh bhai username password?"}, status=400)

    try:
        client = Client.objects.get(name=username)
    except Client.DoesNotExist:
        return Response({"success": "false", "error": "not found"}, status=404)

    if client.password != password:
        return Response({"success": "false", "error": "incorr"}, status=401)

    return Response({
        "success": "true",
        "_id": str(client._id),
        "name": client.name,
        "email": client.email,
    })

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def clients(request):
    
    if request.method == 'PUT':
        try:
            client_id = request.data.get('_id')
            client = Client.objects.get(_id=ObjectId(client_id))
            serializer = ClientSerializer(client, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        name = request.query_params.get('name', '')
        clients = Client.objects.filter(name__icontains=name)
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        try:
            ids = [ObjectId(_id) for _id in request.data.get('_ids', [])]
            deleted_count, _ = Client.objects.filter(_id__in=ids).delete()
            return Response({'message': f'Deleted {deleted_count} clients'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        


@api_view(['POST'])
def get_product(request):
    product_data = {
        "image_url": request.data.get("imageUrl"),
        "price": request.data.get("price"),
        "product_description": request.data.get("description"),
        "product_name": request.data.get("productName"),
        "product_category": request.data.get("category"),
        "quantity": request.data.get("quantity")
    }

    serializer = ProductSerializer(data=product_data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success": "true", "product": serializer.data})
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def checkout_products(request):
    items = request.data.get('items')
    if not items:
        return Response({"error": "Missing or empty 'items' in request data"}, status=400)

    errors = []
    updated_products = []

    for item in items:
        product_id_str = item.get('id')
        quantity_bought = item.get('quantity')

        if product_id_str is None or quantity_bought is None:
            errors.append("Each item must have 'id' and 'quantity'.")
            continue

        try:
            product_id = ObjectId(product_id_str)
        except Exception:
            errors.append(f"Invalid product id format: {product_id_str}")
            continue

        try:
            product = Product.objects.get(_id=product_id)
        except Product.DoesNotExist:
            errors.append(f"Product with id {product_id_str} not found.")
            continue

        try:
            quantity_bought = int(quantity_bought)
        except (ValueError, TypeError):
            errors.append(f"Invalid quantity for product {product_id_str}")
            continue

        if quantity_bought <= 0:
            errors.append(f"Quantity must be positive for product {product_id_str}")
            continue

        if product.quantity < quantity_bought:
            errors.append(f"Not enough stock for product {product.product_name}. Available: {product.quantity}")
            continue

        product.quantity -= quantity_bought
        product.save()
        updated_products.append(product)

    if errors:
        return Response({"errors": errors}, status=400)

    serializer = ProductSerializer(updated_products, many=True)
    return Response(serializer.data, status=200)


@api_view(['GET', 'PUT'])
def get_all_products(request, pk=None):
    """
    - GET /clients/api/products/      → list all products
    - PUT /clients/api/products/<pk>/ → update one product (partial)
    """
    # ──────────── HANDLE GET (list all products) ────────────
    if request.method == 'GET':
        # If pk is provided, you might choose to return a single product,
        # but here we assume GET /.../products/ always lists all.
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def list_products(request):
    """
    GET /clients/api/products/
    """
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
def product_detail(request, pk):
    """
    Handle both:
    GET /api/products/<pk>/ → get single product
    PUT /api/products/<pk>/ → update product
    """
    try:
        product = Product.objects.get(_id=ObjectId(pk))
    except Product.DoesNotExist:
        return Response(
            {"error": f"Product with id {pk} not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # partial=True allows partial updates
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)