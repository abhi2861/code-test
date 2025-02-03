DELIMITER //

CREATE TRIGGER trg_user_investment_status_insert_update
AFTER INSERT ON UserInvestment
FOR EACH ROW
BEGIN
    IF NEW.status IS NOT NULL THEN
        INSERT INTO StatusHistory (userInvestmentId, status, date, active, createdAt, updatedAt)
        VALUES (NEW.id, NEW.status, NOW(), 1, NOW(), NOW());
    END IF;
END;
//

CREATE TRIGGER trg_user_investment_status_update
AFTER UPDATE ON UserInvestment
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO StatusHistory (userInvestmentId, status, date, active, createdAt, updatedAt)
        VALUES (NEW.id, NEW.status, NOW(), 1, NOW(), NOW());
    END IF;
END;
//

DELIMITER ;
