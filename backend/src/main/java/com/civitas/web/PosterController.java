package com.civitas.web;
import java.io.IOException;
import java.nio.file.*;
import java.time.Duration;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Poster upload (organisers only, see SecurityConfig) and public poster download. */
@RestController @RequestMapping("/api")
class PosterController {
  private static final Pattern SAFE_NAME = Pattern.compile("[a-f0-9\\-]{36}\\.(png|jpg|webp)");
  private final Path dir;
  PosterController(@Value("${civitas.upload-dir}") String d) throws IOException {
    dir = Path.of(d).toAbsolutePath().normalize(); Files.createDirectories(dir);
  }
  record Uploaded(String url) {}

  @PostMapping("/organizer/posters") @ResponseStatus(HttpStatus.CREATED)
  Uploaded upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Choose an image file.");
    byte[] bytes = file.getBytes();
    String ext = detect(bytes); // trust the file contents, not the filename or declared type
    if (ext == null) throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PNG, JPEG or WebP images are allowed.");
    String name = UUID.randomUUID() + "." + ext;
    Files.write(dir.resolve(name), bytes);
    return new Uploaded("/api/posters/" + name);
  }

  @GetMapping("/posters/{name:.+}")
  ResponseEntity<byte[]> get(@PathVariable String name) throws IOException {
    if (!SAFE_NAME.matcher(name).matches()) throw new ApiException(HttpStatus.NOT_FOUND, "Poster not found");
    Path p = dir.resolve(name).normalize();
    if (!p.startsWith(dir) || !Files.exists(p)) throw new ApiException(HttpStatus.NOT_FOUND, "Poster not found");
    MediaType type = name.endsWith("png") ? MediaType.IMAGE_PNG : name.endsWith("jpg") ? MediaType.IMAGE_JPEG : MediaType.parseMediaType("image/webp");
    return ResponseEntity.ok().contentType(type).header("X-Content-Type-Options", "nosniff")
        .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic()).body(Files.readAllBytes(p));
  }

  private static String detect(byte[] b) {
    if (b.length < 12) return null;
    if ((b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return "png";
    if ((b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return "jpg";
    if (b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "webp";
    return null;
  }
}
