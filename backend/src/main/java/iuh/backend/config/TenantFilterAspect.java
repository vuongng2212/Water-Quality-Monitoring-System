package iuh.backend.config;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class TenantFilterAspect {

    private static final Logger logger = LoggerFactory.getLogger(TenantFilterAspect.class);

    @Autowired
    private EntityManager entityManager;

    @Around("execution(* iuh.backend.repository.*.*(..))")
    public Object applyTenantFilter(ProceedingJoinPoint joinPoint) throws Throwable {
        Session session = entityManager.unwrap(Session.class);
        Long tenantId = TenantContext.getTenantId();

        logger.debug("Applying tenant filter for method: {} with tenantId: {}", joinPoint.getSignature().toShortString(), tenantId);

        if (tenantId != null) {
            Filter filter = session.enableFilter("tenantFilter");
            filter.setParameter("tenantId", tenantId);
            logger.debug("Tenant filter 'tenantFilter' enabled with tenantId: {}", tenantId);
        } else {
            logger.debug("No tenantId found in TenantContext. Tenant filter not applied.");
        }

        try {
            return joinPoint.proceed();
        } finally {
            if (session.isOpen() && session.getSessionFactory().getFilterDefinition("tenantFilter") != null) {
                session.disableFilter("tenantFilter");
                logger.debug("Tenant filter 'tenantFilter' disabled.");
            }
        }
    }
}