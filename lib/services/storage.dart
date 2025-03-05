import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:path_provider/path_provider.dart';
import 'dart:io' as io;
import 'package:web/web.dart' as web;

abstract class Storage {
  Future<String?> getItem(String key);
  Future<void> setItem(String key, String value);
  Future<bool> containsKey(String key);
}

class FileStorage implements Storage {
  final String _fileName;

  FileStorage(this._fileName);

  @override
  Future<String?> getItem(String key) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = io.File('${directory.path}/$_fileName');
      if (await file.exists()) {
        return await file.readAsString();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> setItem(String key, String value) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = io.File('${directory.path}/$_fileName');
      await file.writeAsString(value);
    } catch (e) {
      throw Exception('Error al guardar el archivo: $e');
    }
  }

  @override
  Future<bool> containsKey(String key) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = io.File('${directory.path}/$_fileName');
      return await file.exists();
    } catch (e) {
      return false;
    }
  }
}

class WebStorage implements Storage {
  final String _fileName;

  WebStorage(this._fileName);

  @override
  Future<String?> getItem(String key) async {
    try {
      final storage = web.window.localStorage;
      return storage[_fileName];
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> setItem(String key, String value) async {
    try {
      final storage = web.window.localStorage;
      storage[_fileName] = value;
    } catch (e) {
      throw Exception('Error al guardar en localStorage: $e');
    }
  }

  @override
  Future<bool> containsKey(String key) async {
    try {
      final storage = web.window.localStorage;
      return storage[_fileName] != null;
    } catch (e) {
      return false;
    }
  }
}

Storage createStorage(String fileName) {
  if (kIsWeb) {
    return WebStorage(fileName);
  } else {
    return FileStorage(fileName);
  }
} 