import 'package:flutter/services.dart';
import 'package:csv/csv.dart';
import 'package:logging/logging.dart';
import '../models/contacto.dart';
import 'storage.dart';

class CsvService {
  static const String _fileName = 'datos_hospital_corregido.csv';
  late final Storage _storage;
  final _logger = Logger('CsvService');

  CsvService() {
    _storage = createStorage(_fileName);
  }

  Future<void> _inicializarArchivo() async {
    _logger.info('Inicializando archivo CSV...');
    try {
      if (!await _storage.containsKey(_fileName)) {
        _logger.info('Archivo no existe, copiando desde assets...');
        final String csvContent = await rootBundle.loadString('assets/$_fileName');
        _logger.info('Contenido CSV cargado desde assets: ${csvContent.length} bytes');
        await _storage.setItem(_fileName, csvContent);
        _logger.info('Archivo inicializado correctamente');
      } else {
        _logger.info('El archivo ya existe en storage');
      }
    } catch (e) {
      _logger.severe('Error al inicializar archivo: $e');
      rethrow;
    }
  }

  Future<List<Contacto>> cargarContactos() async {
    _logger.info('Cargando contactos...');
    try {
      await _inicializarArchivo();
      final String? csvContent = await _storage.getItem(_fileName);
      
      if (csvContent == null || csvContent.isEmpty) {
        _logger.warning('Contenido CSV vacío o nulo, intentando cargar desde assets...');
        final String csvFromAssets = await rootBundle.loadString('assets/$_fileName');
        await _storage.setItem(_fileName, csvFromAssets);
        _logger.info('Contenido cargado desde assets');
        return _procesarContenidoCSV(csvFromAssets);
      }
      
      return _procesarContenidoCSV(csvContent);
    } catch (e) {
      _logger.severe('Error al cargar contactos: $e');
      throw Exception('Error al cargar los contactos: $e');
    }
  }

  List<Contacto> _procesarContenidoCSV(String csvContent) {
    _logger.info('Procesando contenido CSV...');
    try {
      final List<List<dynamic>> csvData = const CsvToListConverter(
        shouldParseNumbers: false,
        fieldDelimiter: ',',
        eol: '\n',
      ).convert(csvContent);
      
      _logger.info('Filas CSV encontradas: ${csvData.length}');
      
      final List<Contacto> contactos = [];
      // Empezar desde 1 para saltar el encabezado
      for (var i = 1; i < csvData.length; i++) {
        final row = csvData[i];
        if (row.isEmpty) continue; // Saltar filas vacías
        
        if (row.length >= 4) {
          try {
            contactos.add(Contacto(
              telefono: row[0].toString().trim(),
              edificio: row[1].toString().trim(),
              planta: row[2].toString().trim(),
              servicio: row[3].toString().trim(),
            ));
          } catch (e) {
            _logger.warning('Error al procesar fila $i: $e');
          }
        } else {
          _logger.warning('Fila $i no tiene suficientes columnas: ${row.length}');
        }
      }
      
      _logger.info('Contactos procesados: ${contactos.length}');
      return contactos;
    } catch (e) {
      _logger.severe('Error al procesar CSV: $e');
      throw Exception('Error al procesar el archivo CSV: $e');
    }
  }

  Future<void> anadirContacto(Contacto contacto) async {
    _logger.info('Añadiendo contacto: $contacto');
    try {
      await _inicializarArchivo();
      final String? csvContent = await _storage.getItem(_fileName);
      if (csvContent == null) {
        throw Exception('No se pudo leer el archivo CSV');
      }
      
      final List<List<dynamic>> csvData = const CsvToListConverter(
        shouldParseNumbers: false,
        fieldDelimiter: ',',
        eol: '\n',
      ).convert(csvContent);
      
      csvData.add([
        contacto.telefono,
        contacto.edificio,
        contacto.planta,
        contacto.servicio,
      ]);
      
      final String newCsvContent = const ListToCsvConverter().convert(csvData);
      await _storage.setItem(_fileName, newCsvContent);
      _logger.info('Contacto añadido correctamente');
    } catch (e) {
      _logger.severe('Error al añadir contacto: $e');
      throw Exception('Error al añadir el contacto: $e');
    }
  }

  Future<void> eliminarContacto(Contacto contacto) async {
    _logger.info('Eliminando contacto: $contacto');
    try {
      final String? csvContent = await _storage.getItem(_fileName);
      if (csvContent == null) {
        throw Exception('No se pudo leer el archivo CSV');
      }
      
      final List<List<dynamic>> csvData = const CsvToListConverter(
        shouldParseNumbers: false,
        fieldDelimiter: ',',
        eol: '\n',
      ).convert(csvContent);
      
      csvData.removeWhere((row) =>
        row.length >= 4 &&
        row[0].toString().trim() == contacto.telefono &&
        row[1].toString().trim() == contacto.edificio &&
        row[2].toString().trim() == contacto.planta &&
        row[3].toString().trim() == contacto.servicio
      );
      
      final String newCsvContent = const ListToCsvConverter().convert(csvData);
      await _storage.setItem(_fileName, newCsvContent);
      _logger.info('Contacto eliminado correctamente');
    } catch (e) {
      _logger.severe('Error al eliminar contacto: $e');
      throw Exception('Error al eliminar el contacto: $e');
    }
  }
} 