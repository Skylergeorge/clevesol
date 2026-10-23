<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Session;

class CartService
{
    private const KEY = 'clv_cart';

    /** @return array<int,array{product_id:int,qty:int,size:?string}> */
    public function raw(): array
    {
        return Session::get(self::KEY, []);
    }

    public function add(int $productId, int $qty = 1, ?string $size = null): void
    {
        $items = $this->raw();
        $found = false;
        foreach ($items as &$item) {
            if ($item['product_id'] === $productId && ($item['size'] ?? null) === $size) {
                $item['qty'] = min(999, $item['qty'] + $qty);
                $found = true;
                break;
            }
        }
        unset($item);

        if (! $found) {
            $items[] = ['product_id' => $productId, 'qty' => max(1, $qty), 'size' => $size];
        }

        Session::put(self::KEY, array_values($items));
    }

    public function update(int $index, int $qty): void
    {
        $items = $this->raw();
        if (! isset($items[$index])) {
            return;
        }
        if ($qty <= 0) {
            unset($items[$index]);
        } else {
            $items[$index]['qty'] = min(999, $qty);
        }
        Session::put(self::KEY, array_values($items));
    }

    public function remove(int $index): void
    {
        $items = $this->raw();
        if (isset($items[$index])) {
            unset($items[$index]);
            Session::put(self::KEY, array_values($items));
        }
    }

    public function setLine(int $productId, ?string $size, int $qty): void
    {
        $items = $this->raw();
        foreach ($items as $index => $item) {
            if ($item['product_id'] === $productId && ($item['size'] ?? null) === $size) {
                if ($qty <= 0) {
                    unset($items[$index]);
                } else {
                    $items[$index]['qty'] = min(999, $qty);
                }
                Session::put(self::KEY, array_values($items));

                return;
            }
        }
    }

    public function clear(): void
    {
        Session::forget(self::KEY);
    }

    public function count(): int
    {
        return array_sum(array_map(fn ($i) => $i['qty'], $this->raw()));
    }

    /** Hydrate cart with product data for display. */
    public function detailed(): array
    {
        $items = $this->raw();
        if (empty($items)) {
            return ['items' => [], 'subtotal' => 0, 'count' => 0];
        }

        $products = Product::with('category')
            ->whereIn('id', array_column($items, 'product_id'))
            ->get()
            ->keyBy('id');

        $lines = [];
        $subtotal = 0;
        foreach ($items as $index => $item) {
            $product = $products->get($item['product_id']);
            if (! $product) {
                continue;
            }
            $lineTotal = (float) $product->price * $item['qty'];
            $subtotal += $lineTotal;
            $lines[] = [
                'index' => $index,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'subtitle' => $product->subtitle,
                'category' => $product->category?->name,
                'accent' => $product->category?->accent,
                'icon' => $product->category?->icon,
                'image_path' => $product->image_path,
                'price' => (float) $product->price,
                'qty' => $item['qty'],
                'size' => $item['size'] ?? null,
                'line_total' => round($lineTotal, 2),
            ];
        }

        return [
            'items' => $lines,
            'subtotal' => round($subtotal, 2),
            'count' => $this->count(),
        ];
    }
}
