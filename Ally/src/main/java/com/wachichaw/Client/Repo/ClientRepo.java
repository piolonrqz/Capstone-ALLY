package com.wachichaw.Client.Repo;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wachichaw.Client.Entity.ClientEntity;

@Repository
public interface ClientRepo extends JpaRepository<ClientEntity, Integer>{
    boolean existsByEmail(String email);
}
