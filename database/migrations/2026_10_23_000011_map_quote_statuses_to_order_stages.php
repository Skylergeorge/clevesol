<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $map = [
            'new' => 'draft',
            'reviewing' => 'confirmed',
            'quoted' => 'preparing',
            'closed' => 'delivered',
        ];

        foreach ($map as $from => $to) {
            DB::table('quote_requests')->where('status', $from)->update(['status' => $to]);
        }
    }

    public function down(): void
    {
        $map = [
            'draft' => 'new',
            'confirmed' => 'reviewing',
            'preparing' => 'quoted',
            'packed' => 'quoted',
            'partially_delivered' => 'quoted',
            'delivered' => 'closed',
            'cancelled' => 'closed',
        ];

        foreach ($map as $from => $to) {
            DB::table('quote_requests')->where('status', $from)->update(['status' => $to]);
        }
    }
};
