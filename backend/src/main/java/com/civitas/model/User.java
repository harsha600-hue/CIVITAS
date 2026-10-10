package com.civitas.model;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
@Entity @Table(name = "users") @Getter @Setter
public class User {
  public enum Role { USER, ORGANIZER }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  private String name;
  private String email;
  private String passwordHash;
  @Enumerated(EnumType.STRING) private Role role = Role.USER;
  private Instant createdAt = Instant.now();
}
