class Contacto {
  final String telefono;
  final String edificio;
  final String planta;
  final String servicio;

  Contacto({
    required this.telefono,
    required this.edificio,
    required this.planta,
    required this.servicio,
  });

  factory Contacto.fromCSV(String csvLine) {
    final partes = csvLine.split(',');
    if (partes.length >= 4) {
      return Contacto(
        telefono: partes[0].trim(),
        edificio: partes[1].trim(),
        planta: partes[2].trim(),
        servicio: partes[3].trim(),
      );
    }
    throw Exception('Formato de CSV inválido: $csvLine');
  }

  String toCSV() {
    return '$telefono,$edificio,$planta,$servicio';
  }

  String formatearRegistro() {
    return '$telefono - $edificio - $planta - $servicio';
  }

  bool matchesBusqueda(String termino) {
    if (termino.isEmpty) return true;
    termino = termino.toLowerCase();
    return telefono.toLowerCase().contains(termino) ||
           edificio.toLowerCase().contains(termino) ||
           planta.toLowerCase().contains(termino) ||
           servicio.toLowerCase().contains(termino);
  }
} 