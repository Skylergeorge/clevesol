<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storefront_chats', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->string('visitor_name');
            $table->string('visitor_email')->nullable();
            $table->string('visitor_phone')->nullable();
            $table->string('status')->default('open'); // open | closed
            $table->boolean('staff_unread')->default(false);
            $table->unsignedInteger('staff_unread_count')->default(0);
            $table->boolean('visitor_unread')->default(false);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('visitor_typing_at')->nullable();
            $table->timestamp('staff_typing_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'last_message_at']);
        });

        Schema::create('storefront_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('storefront_chat_id')->constrained()->cascadeOnDelete();
            $table->string('sender'); // visitor | staff
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index('storefront_chat_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storefront_messages');
        Schema::dropIfExists('storefront_chats');
    }
};
