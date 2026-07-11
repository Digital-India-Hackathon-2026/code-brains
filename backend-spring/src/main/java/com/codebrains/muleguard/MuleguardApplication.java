package com.codebrains.muleguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
<<<<<<< HEAD
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;

// Datasource/JPA autoconfiguration is excluded so the app boots and serves
// the same endpoints without needing a real Postgres connection.
@SpringBootApplication(exclude = {
		DataSourceAutoConfiguration.class,
		HibernateJpaAutoConfiguration.class,
		JpaRepositoriesAutoConfiguration.class
})
=======

@SpringBootApplication
>>>>>>> 26a6597d8f8a6eca43b5393131116fda7afaa882
public class MuleguardApplication {

	public static void main(String[] args) {
		SpringApplication.run(MuleguardApplication.class, args);
	}

}
