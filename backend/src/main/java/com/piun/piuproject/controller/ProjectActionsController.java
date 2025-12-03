package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-actions")
@CrossOrigin(origins = "*")
public class ProjectActionsController {

    @Autowired
    private ContractProfilingWorksRepository worksRepository;
    
    @Autowired
    private ContractProfilingGoodsRepository goodsRepository;

    @GetMapping("/works")
    public List<ContractProfilingWorks> getAllWorks() {
        return worksRepository.findAll();
    }

    @GetMapping("/works/project/{projectId}")
    public List<ContractProfilingWorks> getWorksByProject(@PathVariable String projectId) {
        return worksRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/works")
    public ContractProfilingWorks createWorks(@RequestBody ContractProfilingWorks works) {
        return worksRepository.save(works);
    }

    @PutMapping("/works/{id}")
    public ResponseEntity<ContractProfilingWorks> updateWorks(
            @PathVariable Long id, 
            @RequestBody ContractProfilingWorks worksDetails) {
        return worksRepository.findById(id)
            .map(works -> {
                works.setContractRefNo(worksDetails.getContractRefNo());
                works.setContractValue(worksDetails.getContractValue());
                works.setNameOfContractor(worksDetails.getNameOfContractor());
                works.setNameOfConsultant(worksDetails.getNameOfConsultant());
                works.setContractStartDate(worksDetails.getContractStartDate());
                works.setContractEndDate(worksDetails.getContractEndDate());
                works.setRemarks(worksDetails.getRemarks());
                return ResponseEntity.ok(worksRepository.save(works));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/works/{id}")
    public ResponseEntity<Void> deleteWorks(@PathVariable Long id) {
        return worksRepository.findById(id)
            .map(works -> {
                worksRepository.delete(works);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/goods")
    public List<ContractProfilingGoods> getAllGoods() {
        return goodsRepository.findAll();
    }

    @GetMapping("/goods/project/{projectId}")
    public List<ContractProfilingGoods> getGoodsByProject(@PathVariable String projectId) {
        return goodsRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/goods")
    public ContractProfilingGoods createGoods(@RequestBody ContractProfilingGoods goods) {
        return goodsRepository.save(goods);
    }

    @PutMapping("/goods/{id}")
    public ResponseEntity<ContractProfilingGoods> updateGoods(
            @PathVariable Long id, 
            @RequestBody ContractProfilingGoods goodsDetails) {
        return goodsRepository.findById(id)
            .map(goods -> {
                goods.setContractRefNo(goodsDetails.getContractRefNo());
                goods.setContractValue(goodsDetails.getContractValue());
                goods.setNameOfSupplier(goodsDetails.getNameOfSupplier());
                goods.setNameOfConsultant(goodsDetails.getNameOfConsultant());
                goods.setContractStartDate(goodsDetails.getContractStartDate());
                goods.setContractEndDate(goodsDetails.getContractEndDate());
                goods.setRemarks(goodsDetails.getRemarks());
                return ResponseEntity.ok(goodsRepository.save(goods));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/goods/{id}")
    public ResponseEntity<Void> deleteGoods(@PathVariable Long id) {
        return goodsRepository.findById(id)
            .map(goods -> {
                goodsRepository.delete(goods);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
