<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $map = [
            'draft' => 'ordered',
            'new' => 'ordered',
            'preparing' => 'contacted',
            'packed' => 'confirmed',
            'partially_delivered' => 'confirmed',
            'reviewing' => 'contacted',
            'quoted' => 'confirmed',
            'closed' => 'delivered',
        ];

        foreach ($map as $from => $to) {
            DB::table('quote_requests')->where('status', $from)->update(['status' => $to]);
        }
    }

    public function down(): void
    {
        $map = [
            'ordered' => 'draft',
            'contacted' => 'preparing',
            'confirmed' => 'confirmed',
            'delivered' => 'delivered',
            'cancelled' => 'cancelled',
        ];

        foreach ($map as $from => $to) {
            DB::table('quote_requests')->where('status', $from)->update(['status' => $to]);
        }
    }
};
