<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('solicitud_pago', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->unsignedInteger('id_usuario');
            $table->decimal('monto', 10, 2);
            $table->string('nro_operacion', 100)->nullable();
            $table->string('comprobante_url', 255)->nullable();
            $table->string('estado', 20)->default('Pendiente'); // Pendiente, Aprobado, Rechazado
            $table->timestamps();

            // Relación
            $table->foreign('id_usuario')->references('id_usuario')->on('usuario')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud_pago');
    }
};
