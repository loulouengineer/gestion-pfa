package tn.enicarthage.projetspring.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceAspect {

    // Pointcut — cible tous les services
    @Pointcut("execution(* tn.enicarthage.projetspring.service.*.*(..))")
    public void serviceMethods() {}

    // Advice Around — mesure le temps d'exécution de chaque service
    @Around("serviceMethods()")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed(); // exécute la méthode

        long duration = System.currentTimeMillis() - start;
        String method = joinPoint.getSignature().toShortString();

        if (duration > 1000) {
            System.out.println("[AOP] Méthode LENTE : " + method + " → " + duration + "ms");
        } else {
            System.out.println(" [AOP] " + method + " → " + duration + "ms");
        }

        return result;
    }
}