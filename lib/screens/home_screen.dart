import 'package:flutter/material.dart';
import '../models/contacto.dart';
import '../services/csv_service.dart';
import 'package:logging/logging.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final CsvService _csvService = CsvService();
  final _logger = Logger('HomeScreen');
  List<Contacto> _contactos = [];
  List<Contacto> _contactosFiltrados = [];
  bool _isLoading = true;
  String _error = '';
  final TextEditingController _searchController = TextEditingController();
  String _terminoBusqueda = '';

  @override
  void initState() {
    super.initState();
    _logger.info('Iniciando HomeScreen');
    _cargarContactos();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _cargarContactos() async {
    _logger.info('Iniciando carga de contactos');
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = '';
    });
    
    try {
      final contactos = await _csvService.cargarContactos();
      _logger.info('Contactos cargados: ${contactos.length}');
      
      if (!mounted) return;
      setState(() {
        _contactos = contactos;
        _filtrarContactos(_terminoBusqueda);
        _isLoading = false;
      });
    } catch (e) {
      _logger.severe('Error al cargar contactos: $e');
      if (!mounted) return;
      
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
      _mostrarError('Error al cargar los contactos: $e');
    }
  }

  void _mostrarError(String mensaje) {
    if (!mounted) return;
    _logger.warning('Mostrando error: $mensaje');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: SingleChildScrollView(
          child: Text(mensaje),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Aceptar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _cargarContactos();
            },
            child: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }

  void _filtrarContactos(String termino) {
    setState(() {
      _terminoBusqueda = termino;
      if (termino.isEmpty) {
        _contactosFiltrados = _contactos;
      } else {
        _contactosFiltrados = _contactos
            .where((contacto) => contacto.matchesBusqueda(termino.toLowerCase()))
            .toList();
      }
      _logger.info('Contactos filtrados: ${_contactosFiltrados.length}');
    });
  }

  Future<void> _mostrarDialogoAnadirContacto() async {
    final TextEditingController telefonoController = TextEditingController();
    final TextEditingController edificioController = TextEditingController();
    final TextEditingController plantaController = TextEditingController();
    final TextEditingController servicioController = TextEditingController();
    
    if (!mounted) return;
    
    final BuildContext dialogContext = context;
    await showDialog(
      context: dialogContext,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Añadir Contacto'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: telefonoController,
                  decoration: const InputDecoration(
                    labelText: 'Teléfono',
                    hintText: 'Ingrese el número de teléfono',
                  ),
                ),
                TextField(
                  controller: edificioController,
                  decoration: const InputDecoration(
                    labelText: 'Edificio',
                    hintText: 'Ingrese el nombre del edificio',
                  ),
                ),
                TextField(
                  controller: plantaController,
                  decoration: const InputDecoration(
                    labelText: 'Planta',
                    hintText: 'Ingrese la planta',
                  ),
                ),
                TextField(
                  controller: servicioController,
                  decoration: const InputDecoration(
                    labelText: 'Servicio',
                    hintText: 'Ingrese el nombre del servicio',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () async {
                final nuevoContacto = Contacto(
                  telefono: telefonoController.text,
                  edificio: edificioController.text,
                  planta: plantaController.text,
                  servicio: servicioController.text,
                );

                try {
                  await _csvService.anadirContacto(nuevoContacto);
                  if (!mounted) return;
                  
                  Navigator.of(context).pop();
                  await _cargarContactos();
                } catch (e) {
                  if (!mounted) return;
                  _mostrarError('Error al añadir contacto: $e');
                }
              },
              child: const Text('Guardar'),
            ),
          ],
        );
      },
    );
  }

  void _mostrarDialogoEliminarContacto(Contacto contacto) {
    if (!mounted) return;
    
    final BuildContext dialogContext = context;
    showDialog(
      context: dialogContext,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Contacto'),
        content: Text('¿Está seguro de que desea eliminar este contacto?\n\n${contacto.formatearRegistro()}'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await _csvService.eliminarContacto(contacto);
                if (!mounted) return;
                
                Navigator.pop(context);
                await _cargarContactos();
              } catch (e) {
                if (!mounted) return;
                _mostrarError('Error al eliminar el contacto');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Listín Telefónico'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarContactos,
            tooltip: 'Recargar',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar contacto...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _terminoBusqueda.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _filtrarContactos('');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              onChanged: _filtrarContactos,
            ),
          ),
          if (_terminoBusqueda.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Resultados: ${_contactosFiltrados.length}',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('Cargando contactos...'),
                      ],
                    ),
                  )
                : _error.isNotEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.error_outline, size: 64, color: Colors.red),
                            const SizedBox(height: 16),
                            Text(
                              'Error al cargar los contactos',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.red[700],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _error,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 14),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _cargarContactos,
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : _contactosFiltrados.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  _terminoBusqueda.isEmpty
                                      ? 'No hay contactos disponibles\nTotal contactos cargados: ${_contactos.length}'
                                      : 'No se encontraron contactos para "$_terminoBusqueda"',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 18,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                if (_terminoBusqueda.isEmpty) ...[
                                  const SizedBox(height: 16),
                                  ElevatedButton(
                                    onPressed: _cargarContactos,
                                    child: const Text('Recargar contactos'),
                                  ),
                                ],
                              ],
                            ),
                          )
                        : ListView.builder(
                            itemCount: _contactosFiltrados.length,
                            itemBuilder: (context, index) {
                              final contacto = _contactosFiltrados[index];
                              return Card(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                child: ListTile(
                                  leading: const CircleAvatar(
                                    child: Icon(Icons.phone),
                                  ),
                                  title: Text(
                                    contacto.formatearRegistro(),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.delete),
                                    onPressed: () => _mostrarDialogoEliminarContacto(contacto),
                                    color: Colors.red,
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _mostrarDialogoAnadirContacto,
        label: const Text('Añadir Contacto'),
        icon: const Icon(Icons.add),
      ),
    );
  }
} 