package iuh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "factories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Factory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    @OneToMany(mappedBy = "factory", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<User> users;

    @OneToMany(mappedBy = "factory", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Device> devices;
}